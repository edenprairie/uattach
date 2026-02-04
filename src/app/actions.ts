'use server';

import { prisma } from '@/lib/prisma';
import { User, Product } from '@prisma/client';
import { revalidatePath } from 'next/cache';

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
        // Remove password from returned object
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    return null;
}

export async function registerUser(data: any) {
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

    const { password: _, ...safeUser } = user;
    return safeUser;
}

export async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
    // Strip passwords
    return users.map(({ password, ...u }) => u);
}

// --- Product Actions ---

export async function getProducts() {
    return await prisma.product.findMany();
}

// --- Order Actions ---

export async function createOrder(data: any) {
    try {
        // 1. Transaction to create Order + Items + Address
        const orderData: any = {
            totalWeightKg: data.totalWeightKg,
            splitStrategy: data.splitStrategy,
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
            },
            items: {
                create: data.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            }
        };

        // Explicitly connect the user if ID is provided
        // This is safer than scalar binding for optional relations
        if (data.userId) {
            orderData.user = {
                connect: { id: data.userId }
            };
        }

        const order = await prisma.order.create({
            data: orderData,
            include: { items: true, shippingAddress: true }
        });

        return order;
    } catch (e: any) {
        console.error('SERVER ACTION ERROR: createOrder', e);
        // Check for specific Prisma errors
        if (e.code === 'P2003') {
            throw new Error('Invalid User ID. Please log out and log in again.');
        }
        throw new Error(`Order failed: ${e.message}`);
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
            containers: true,
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
            containers: true,
            shippingAddress: true,
            user: true // Include user for admin checks if needed
        }
    });
    return order;
}
