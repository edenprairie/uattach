'use server';

import { prisma } from '@/lib/prisma';
import { buildContainerPersistencePlan, SubmittedOrderItem } from '@/lib/orderPersistence';
import type { Prisma } from '@prisma/client';

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

function stripPassword<T extends { password: string }>(user: T): Omit<T, 'password'> {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
}

// --- Auth Actions ---

export async function loginUser(username: string, password: string) {
    // In a real app, hash password comparison here
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: { equals: username, mode: 'insensitive' } },
                { email: { equals: username, mode: 'insensitive' } }
            ]
        },
        include: { shippingAddress: true }
    });

    if (user && user.password === password) {
        return stripPassword(user);
    }
    return null;
}

export async function registerUser(data: RegisterUserInput) {
    const exists = await prisma.user.findFirst({
        where: { username: { equals: data.username, mode: 'insensitive' } }
    });

    if (exists) throw new Error('Username already exists');

    const user = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: data.password, // Plain text for mock
            role: data.role || 'user'
        }
    });

    return stripPassword(user);
}

export async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return users.map(stripPassword);
}

export async function updateUserPassword(adminId: string, targetUserId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    // Require at least one number and one special character
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasNumber || !hasSpecial) {
        throw new Error('Password must contain at least one number and one special character');
    }

    // Verify admin
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
    });

    if (!admin || admin.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can reset passwords');
    }

    // Update target user
    await prisma.user.update({
        where: { id: targetUserId },
        data: { password: newPassword } // In real app, hash this!
    });

    return { success: true };
}

// --- Product Actions ---

export async function getProducts() {
    return await prisma.product.findMany();
}

// --- Order Actions ---

export async function createOrder(data: CreateOrderInput) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    if (!data.shippingAddress) {
        throw new Error('Shipping address is required');
    }

    const requiredAddressFields: Array<keyof OrderShippingAddressInput> = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'line1',
        'city',
        'state',
        'zip'
    ];
    for (const field of requiredAddressFields) {
        if (!data.shippingAddress[field]) {
            throw new Error(`Shipping address field '${field}' is required`);
        }
    }

    for (const item of data.items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
            throw new Error('Each item must have a valid product ID and quantity');
        }
    }

    try {
        const submittedItems: SubmittedOrderItem[] = data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
        }));

        const products = await prisma.product.findMany({
            where: {
                id: { in: submittedItems.map((item) => item.productId) }
            },
            select: {
                id: true,
                weightKg: true,
            }
        });

        const containerPlan = buildContainerPersistencePlan(submittedItems, products);
        const totalWeightKg = containerPlan.reduce((sum, container) => sum + container.totalWeightKg, 0);

        if (totalWeightKg <= 0) {
            throw new Error('Invalid total weight');
        }

        const orderData: Prisma.OrderCreateInput = {
            totalWeightKg,
            splitStrategy: data.splitStrategy || 'weight_optimized',
            shippingAddress: {
                create: {
                    firstName: data.shippingAddress.firstName,
                    lastName: data.shippingAddress.lastName,
                    company: data.shippingAddress.company,
                    email: data.shippingAddress.email,
                    phone: data.shippingAddress.phone,
                    line1: data.shippingAddress.line1,
                    line2: data.shippingAddress.line2,
                    city: data.shippingAddress.city,
                    state: data.shippingAddress.state,
                    zip: data.shippingAddress.zip,
                }
            }
        };

        // Connect user if ID is provided and user exists
        if (data.userId) {
            const userExists = await prisma.user.findUnique({
                where: { id: data.userId },
                select: { id: true }
            });
            if (userExists) {
                orderData.user = {
                    connect: { id: data.userId }
                };
            }
        }

        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: orderData,
                include: { shippingAddress: true }
            });

            for (const container of containerPlan) {
                const createdContainer = await tx.container.create({
                    data: {
                        orderId: createdOrder.id,
                        number: container.number,
                        totalWeightKg: container.totalWeightKg,
                        maxWeightKg: container.maxWeightKg,
                    }
                });

                await tx.orderItem.createMany({
                    data: container.items.map((item) => ({
                        orderId: createdOrder.id,
                        containerId: createdContainer.id,
                        productId: item.productId,
                        quantity: item.quantity,
                    }))
                });
            }

            return tx.order.findUniqueOrThrow({
                where: { id: createdOrder.id },
                include: {
                    items: { include: { product: true } },
                    containers: {
                        include: {
                            items: { include: { product: true } }
                        },
                        orderBy: { number: 'asc' }
                    },
                    shippingAddress: true,
                    user: true,
                }
            });
        });

        return order;
    } catch (error: unknown) {
        console.error('SERVER ACTION ERROR: createOrder', error);
        const orderError = error as { code?: string; message?: string };
        // Check for specific Prisma errors
        if (orderError.code === 'P2003') {
            throw new Error('Invalid User ID. Please log out and log in again.');
        }
        throw new Error(`Order failed: ${orderError.message || 'Unknown error'}`);
    }
}

export async function getUserOrders(userId: string) {
    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    // If admin, fetch ALL orders. If not, fetch only their orders.
    const whereClause = isAdmin ? {} : { userId };

    return await prisma.order.findMany({
        where: whereClause,
        include: {
            items: { include: { product: true } },
            containers: {
                include: {
                    items: { include: { product: true } }
                },
                orderBy: { number: 'asc' }
            },
            shippingAddress: true,
            user: true // Include user details so admin sees who placed the order
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getOrder(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { include: { product: true } },
            containers: {
                include: {
                    items: { include: { product: true } }
                },
                orderBy: { number: 'asc' }
            },
            shippingAddress: true,
            user: true // Include user for admin checks if needed
        }
    });
    return order;
}

export async function updateOrderStatus(adminId: string, orderId: string, status: string) {
    const allowedStatuses = ['pending', 'processing', 'shipped'];

    if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid order status');
    }

    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
    });

    if (!admin || admin.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update order status');
    }

    return await prisma.order.update({
        where: { id: orderId },
        data: { status },
    });
}
