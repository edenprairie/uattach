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

export interface Order {
    id: string;
    items: OrderItem[];
    containers: Container[];
    splitStrategy: 'weight_optimized' | 'simple';
}
