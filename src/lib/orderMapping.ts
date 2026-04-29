import { Container, Order, OrderItem, Product, ShippingAddress } from './types';

interface DbProduct {
    id: string;
    name: string;
    category: string;
    description: string;
    weightKg: number;
    pdfUrl: string;
    imageUrl?: string | null;
    features?: string[];
}

interface DbOrderItem {
    product: DbProduct;
    quantity: number;
}

interface DbContainer {
    id: string;
    number: number;
    totalWeightKg: number;
    maxWeightKg: number;
    items?: DbOrderItem[];
}

export interface DbOrder {
    id: string;
    userId?: string | null;
    createdAt?: Date | string;
    date?: Date | string;
    items?: DbOrderItem[];
    containers?: DbContainer[];
    shippingAddress: ShippingAddress;
    status?: Order['status'];
    totalWeightKg: number;
    splitStrategy?: Order['splitStrategy'];
}

function toIsoDate(value?: Date | string): string {
    if (!value) return new Date().toISOString();
    return value instanceof Date ? value.toISOString() : value;
}

function mapProduct(product: DbProduct): Product {
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        weightKg: product.weightKg,
        pdfUrl: product.pdfUrl,
        imageUrl: product.imageUrl || undefined,
        features: product.features,
    };
}

function mapOrderItem(item: DbOrderItem): OrderItem {
    return {
        product: mapProduct(item.product),
        quantity: item.quantity,
    };
}

function mapContainer(container: DbContainer): Container {
    return {
        id: container.id,
        number: container.number,
        totalWeightKg: container.totalWeightKg,
        maxWeightKg: container.maxWeightKg,
        items: container.items?.map(mapOrderItem) || [],
    };
}

export function mapDbOrderToOrder(order: DbOrder): Order {
    return {
        id: order.id,
        userId: order.userId || undefined,
        date: toIsoDate(order.createdAt || order.date),
        items: order.items?.map(mapOrderItem) || [],
        containers: order.containers?.map(mapContainer) || [],
        shippingAddress: order.shippingAddress,
        status: order.status || 'pending',
        totalWeightKg: order.totalWeightKg,
        splitStrategy: order.splitStrategy || 'weight_optimized',
    };
}
