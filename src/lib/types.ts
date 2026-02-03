export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    weightKg: number;
    pdfUrl: string;
    imageUrl?: string;
    features?: string[];
}

export interface OrderItem {
    product: Product;
    quantity: number;
}

export interface Container {
    id: string;
    items: OrderItem[];
    totalWeightKg: number;
    maxWeightKg: number;
    number: number; // 1st container, 2nd container...
}

export interface User {
    id: string;
    username: string;
    email?: string;
    role: 'admin' | 'user';
    shippingAddress?: ShippingAddress;
}

export interface ShippingAddress {
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

export interface Order {
    id: string;
    userId?: string; // Optional for guest checkout compatibility
    date: string;
    items: OrderItem[];
    containers: Container[];
    shippingAddress: ShippingAddress;
    status: 'pending' | 'processing' | 'shipped';
    totalWeightKg: number;
    splitStrategy: 'weight_optimized' | 'simple';
}
