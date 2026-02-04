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
    // 1. Transaction to create Order + Items + Address
    const order = await prisma.order.create({
        data: {
            userId: data.userId, // Optional
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
                    // If user is logged in, link address to user too? 
                    // For now, simple order-specific address
                }
            },
            items: {
                create: data.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            }
        },
        include: { items: true, shippingAddress: true }
    });

    return order;
}

export async function getUserOrders(userId: string) {
    return await prisma.order.findMany({
        where: { userId },
        include: {
            items: { include: { product: true } },
            containers: true
        },
        orderBy: { createdAt: 'desc' }
    });
}
