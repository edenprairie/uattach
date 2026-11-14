'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { clearSession, createSession, getSessionUser, requireUser } from '@/lib/auth';
import { getDatabase, type D1PreparedStatement } from '@/lib/database';
import { buildContainerPersistencePlan, type SubmittedOrderItem } from '@/lib/orderPersistence';
import type { DbOrder } from '@/lib/orderMapping';
import { hashPassword, verifyPassword } from '@/lib/password';
import { CONTAINER_MIN_WEIGHT_KG } from '@/lib/constants';

type UserRole = 'admin' | 'user' | 'buyer';

interface RegisterUserInput {
    username: string;
    email?: string;
    password: string;
    role?: UserRole;
}

interface OrderShippingAddressInput {
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
}

interface CreateOrderInput {
    userId?: string;
    splitStrategy?: string;
    shippingAddress: OrderShippingAddressInput;
    items: SubmittedOrderItem[];
}

interface ProductRow {
    id: string;
    name: string;
    category: string;
    description: string;
    weightKg: number;
    pdfUrl: string;
    imageUrl: string | null;
    features: string;
}

interface PublicUserRow {
    id: string;
    username: string;
    email: string | null;
    role: UserRole;
    createdAt: string;
}

interface OrderRow {
    id: string;
    userId: string;
    date: string;
    createdAt: string;
    status: 'pending' | 'processing' | 'shipped';
    totalWeightKg: number;
    splitStrategy: 'weight_optimized' | 'simple';
    firstName: string;
    lastName: string;
    company: string | null;
    email: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zip: string;
}

function parseProduct(row: ProductRow) {
    let features: string[] = [];
    try {
        const parsed: unknown = JSON.parse(row.features);
        if (Array.isArray(parsed)) features = parsed.filter((value): value is string => typeof value === 'string');
    } catch {
        features = [];
    }
    return { ...row, features };
}

function normalizeUsername(username: string) {
    return username.trim().toLowerCase();
}

export async function loginUser(username: string, password: string) {
    const database = await getDatabase();
    const identity = username.trim();
    const user = await database.prepare(`
        SELECT id, username, email, password_hash AS passwordHash, role, created_at AS createdAt
        FROM users
        WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE
        LIMIT 1
    `).bind(identity, identity).first<{
        id: string;
        username: string;
        email: string | null;
        passwordHash: string;
        role: UserRole;
        createdAt: string;
    }>();

    if (!user) return null;
    const validPassword = user.passwordHash.startsWith('pbkdf2-sha256$')
        ? await verifyPassword(password, user.passwordHash)
        : user.passwordHash === password;
    if (!validPassword) return null;

    if (!user.passwordHash.startsWith('pbkdf2-sha256$')) {
        await database.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(await hashPassword(password), user.id).run();
    }
    await createSession(user.id);
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

export async function getCurrentUser() {
    return getSessionUser();
}

export async function logoutUser() {
    await clearSession();
}

export async function bootstrapAdmin(data: { username: string; email: string; password: string; setupToken: string }) {
    const { env } = await getCloudflareContext({ async: true });
    const setupSecret = (env as typeof env & { ADMIN_SETUP_TOKEN?: string }).ADMIN_SETUP_TOKEN;
    if (!setupSecret || data.setupToken !== setupSecret) throw new Error('Administrator setup is not authorized.');
    if (data.username.trim().length < 3 || data.password.length < 12) {
        throw new Error('Use a username of at least 3 characters and a password of at least 12 characters.');
    }

    const database = await getDatabase();
    const existingAdmin = await database.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").first<{ id: string }>();
    if (existingAdmin) throw new Error('An administrator account already exists.');

    const username = normalizeUsername(data.username);
    const email = data.email.trim().toLowerCase();
    const id = crypto.randomUUID();
    await database.prepare(`
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES (?, ?, ?, ?, 'admin')
    `).bind(id, username, email, await hashPassword(data.password)).run();
    await createSession(id);
    return { id, username, email, role: 'admin' as const, createdAt: new Date().toISOString() };
}

export async function registerUser(data: RegisterUserInput) {
    const actor = await requireUser();
    if (actor.role !== 'admin') throw new Error('Only administrators can create accounts.');
    if (data.role === 'admin') throw new Error('Administrator accounts must be provisioned separately.');
    if (!data.username.trim() || data.password.length < 12) throw new Error('Enter a username and a password of at least 12 characters.');

    const database = await getDatabase();
    const username = normalizeUsername(data.username);
    const email = data.email?.trim().toLowerCase() || null;
    const duplicate = await database.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE OR (? IS NOT NULL AND email = ? COLLATE NOCASE) LIMIT 1')
        .bind(username, email, email).first<{ id: string }>();
    if (duplicate) throw new Error('That username or email is already in use.');

    const user = {
        id: crypto.randomUUID(),
        username,
        email,
        role: data.role === 'buyer' ? 'buyer' : 'user',
        createdAt: new Date().toISOString(),
    };
    await database.prepare(`
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    `).bind(user.id, user.username, user.email, await hashPassword(data.password), user.role).run();
    return user;
}

export async function getUsers() {
    const actor = await requireUser();
    if (actor.role !== 'admin') throw new Error('Only administrators can view accounts.');
    const database = await getDatabase();
    const { results } = await database.prepare(`
        SELECT id, username, email, role, created_at AS createdAt
        FROM users ORDER BY created_at DESC
    `).all<PublicUserRow>();
    return results;
}

export async function updateUserPassword(adminId: string, targetUserId: string, newPassword: string) {
    void adminId;
    const actor = await requireUser();
    if (actor.role !== 'admin') throw new Error('Unauthorized: only administrators can reset passwords.');
    if (newPassword.length < 12) throw new Error('Password must be at least 12 characters long.');
    const database = await getDatabase();
    const result = await database.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(await hashPassword(newPassword), targetUserId).run();
    if (result.meta.changes === 0) throw new Error('The account could not be found.');
    await database.prepare('DELETE FROM sessions WHERE user_id = ?').bind(targetUserId).run();
    return { success: true };
}

export async function getProducts() {
    const actor = await requireUser();
    if (actor.role === 'buyer') throw new Error('Customer accounts do not have member catalog access.');
    const database = await getDatabase();
    const { results } = await database.prepare(`
        SELECT id, name, category, description, weight_kg AS weightKg, pdf_url AS pdfUrl,
            image_url AS imageUrl, features
        FROM products ORDER BY name
    `).all<ProductRow>();
    return results.map(parseProduct);
}

export async function createOrder(data: CreateOrderInput) {
    const actor = await requireUser();
    if (actor.role === 'buyer') throw new Error('Customer accounts cannot submit wholesale orders.');
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('Order must contain at least one item.');
    if (!data.shippingAddress) throw new Error('Delivery contact is required.');

    const requiredFields: Array<keyof OrderShippingAddressInput> = [
        'firstName', 'lastName', 'email', 'phone', 'line1', 'city', 'state', 'zip',
    ];
    for (const field of requiredFields) {
        const value = data.shippingAddress[field];
        if (typeof value !== 'string' || !value.trim()) throw new Error(`Delivery contact field '${field}' is required.`);
    }

    const items = data.items.map((item) => {
        if (!item.productId || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
            throw new Error('Each product must have a valid quantity between 1 and 999.');
        }
        return { productId: item.productId, quantity: item.quantity };
    });

    const database = await getDatabase();
    const placeholders = items.map(() => '?').join(', ');
    const { results: products } = await database.prepare(`
        SELECT id, weight_kg AS weightKg FROM products WHERE id IN (${placeholders})
    `).bind(...items.map((item) => item.productId)).all<{ id: string; weightKg: number }>();
    const containerPlan = buildContainerPersistencePlan(items, products);
    const lastContainer = containerPlan[containerPlan.length - 1];
    if (!lastContainer || lastContainer.totalWeightKg < CONTAINER_MIN_WEIGHT_KG) {
        throw new Error(`The final container must reach ${CONTAINER_MIN_WEIGHT_KG.toLocaleString()} kg.`);
    }

    const orderId = crypto.randomUUID();
    const statements: D1PreparedStatement[] = [database.prepare(`
        INSERT INTO orders (
            id, user_id, total_weight_kg, split_strategy,
            first_name, last_name, company, email, phone, line1, line2, city, state, zip
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        orderId,
        actor.id,
        containerPlan.reduce((sum, container) => sum + container.totalWeightKg, 0),
        data.splitStrategy || 'weight_optimized',
        data.shippingAddress.firstName.trim(),
        data.shippingAddress.lastName.trim(),
        data.shippingAddress.company?.trim() || null,
        data.shippingAddress.email.trim(),
        data.shippingAddress.phone.trim(),
        data.shippingAddress.line1.trim(),
        data.shippingAddress.line2?.trim() || null,
        data.shippingAddress.city.trim(),
        data.shippingAddress.state.trim(),
        data.shippingAddress.zip.trim(),
    )];

    for (const container of containerPlan) {
        const containerId = crypto.randomUUID();
        statements.push(database.prepare(`
            INSERT INTO containers (id, order_id, number, total_weight_kg, max_weight_kg)
            VALUES (?, ?, ?, ?, ?)
        `).bind(containerId, orderId, container.number, container.totalWeightKg, container.maxWeightKg));
        for (const item of container.items) {
            statements.push(database.prepare(`
                INSERT INTO order_items (id, order_id, product_id, container_id, quantity)
                VALUES (?, ?, ?, ?, ?)
            `).bind(crypto.randomUUID(), orderId, item.productId, containerId, item.quantity));
        }
    }

    await database.batch(statements);
    return { id: orderId };
}

async function loadOrder(orderId: string): Promise<DbOrder | null> {
    const database = await getDatabase();
    const order = await database.prepare(`
        SELECT id, user_id AS userId, date, created_at AS createdAt, status,
            total_weight_kg AS totalWeightKg, split_strategy AS splitStrategy,
            first_name AS firstName, last_name AS lastName, company, email, phone,
            line1, line2, city, state, zip
        FROM orders WHERE id = ?
    `).bind(orderId).first<OrderRow>();
    if (!order) return null;

    const { results: products } = await database.prepare(`
        SELECT oi.id, oi.quantity, oi.container_id AS containerId,
            p.id AS productId, p.name, p.category, p.description, p.weight_kg AS weightKg,
            p.pdf_url AS pdfUrl, p.image_url AS imageUrl, p.features
        FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ? ORDER BY oi.id
    `).bind(orderId).all<{
        id: string;
        quantity: number;
        containerId: string | null;
        productId: string;
        name: string;
        category: string;
        description: string;
        weightKg: number;
        pdfUrl: string;
        imageUrl: string | null;
        features: string;
    }>();
    const { results: containers } = await database.prepare(`
        SELECT id, number, total_weight_kg AS totalWeightKg, max_weight_kg AS maxWeightKg
        FROM containers WHERE order_id = ? ORDER BY number
    `).bind(orderId).all<{ id: string; number: number; totalWeightKg: number; maxWeightKg: number }>();

    const mapItem = (item: (typeof products)[number]) => ({
        quantity: item.quantity,
        product: parseProduct({
            id: item.productId,
            name: item.name,
            category: item.category,
            description: item.description,
            weightKg: item.weightKg,
            pdfUrl: item.pdfUrl,
            imageUrl: item.imageUrl,
            features: item.features,
        }),
    });
    const items = products.map(mapItem);
    const containerItems = containers.map((container) => ({
        ...container,
        items: products.filter((item) => item.containerId === container.id).map(mapItem),
    }));
    const shippingAddress = {
        firstName: order.firstName,
        lastName: order.lastName,
        company: order.company ?? undefined,
        email: order.email,
        phone: order.phone,
        line1: order.line1,
        line2: order.line2 ?? undefined,
        city: order.city,
        state: order.state,
        zip: order.zip,
    };
    return { ...order, items, containers: containerItems, shippingAddress };
}

export async function getUserOrders(userId: string) {
    void userId;
    const actor = await requireUser();
    if (actor.role === 'buyer') throw new Error('Customer accounts do not have member order access.');
    const database = await getDatabase();
    const { results } = await database.prepare(actor.role === 'admin'
        ? 'SELECT id FROM orders ORDER BY created_at DESC'
        : 'SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC')
        .bind(...(actor.role === 'admin' ? [] : [actor.id])).all<{ id: string }>();
    const orders = await Promise.all(results.map((row) => loadOrder(row.id)));
    return orders.filter((order): order is DbOrder => order !== null);
}

export async function getOrder(orderId: string) {
    const actor = await requireUser();
    if (actor.role === 'buyer') throw new Error('Customer accounts do not have member order access.');
    const database = await getDatabase();
    const order = await database.prepare(actor.role === 'admin'
        ? 'SELECT id FROM orders WHERE id = ?'
        : 'SELECT id FROM orders WHERE id = ? AND user_id = ?')
        .bind(...(actor.role === 'admin' ? [orderId] : [orderId, actor.id])).first<{ id: string }>();
    return order ? loadOrder(order.id) : null;
}

export async function updateOrderStatus(adminId: string, orderId: string, status: string) {
    void adminId;
    const actor = await requireUser();
    if (actor.role !== 'admin') throw new Error('Only administrators can update order status.');
    if (!['pending', 'processing', 'shipped'].includes(status)) throw new Error('Invalid order status.');
    const database = await getDatabase();
    const result = await database.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(status, orderId).run();
    if (result.meta.changes === 0) throw new Error('The order could not be found.');
    return { id: orderId, status };
}
