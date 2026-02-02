import { Product } from './types';

export const PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'Skid Steer LowPro Bucket',
        category: 'Buckets',
        description: 'Low profile bucket designed for generic skid steer usage. Optimized for digging efficiency.',
        weightKg: 280,
        pdfUrl: '/assets/Skid Steer_LowPro Buckets.pdf',
        imageUrl: '/assets/IMG_3429.PNG', // Using one of the provided images as thumbnail
        features: ['Low profile design', 'High strength steel', 'Universal coupler'],
    },
    {
        id: 'p2',
        name: 'Skid Steer Ext-LowPro Bucket',
        category: 'Buckets',
        description: 'Extended low profile bucket for moving larger volumes of loose material.',
        weightKg: 320,
        pdfUrl: '/assets/Skid Steer_Ext-LowPro Buckets.pdf',
        imageUrl: '/assets/IMG_8270.PNG',
        features: ['Extended capacity', 'Reinforced cutting edge', 'Visibility slots'],
    },
    {
        id: 'p3',
        name: 'Skid Steer Ext-LowPro Bucket (Type 2)',
        category: 'Buckets',
        description: 'Variation of the extended low profile bucket with specialized reinforcement.',
        weightKg: 350,
        pdfUrl: '/assets/Skid Steer_Ext-LowPro Buckets 2.pdf',
        imageUrl: '/assets/IMG_3429.PNG', // Reusing image for placeholder
        features: ['Type 2 reinforcement', 'Heavy duty wear strips'],
    },
];
