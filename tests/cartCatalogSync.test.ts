import assert from 'node:assert/strict';
import { reconcileCartItems } from '../src/lib/cartCatalog';
import type { OrderItem, Product } from '../src/lib/types';

const savedItems: OrderItem[] = [
    {
        product: {
            id: 'p2',
            name: 'Old Mock Bucket',
            category: 'Buckets',
            description: 'Old data',
            weightKg: 999,
            pdfUrl: '/old.pdf',
        },
        quantity: 3,
    },
    {
        product: {
            id: 'live-1',
            name: 'Stale Name',
            category: 'Buckets',
            description: 'Old description',
            weightKg: 100,
            pdfUrl: '/stale.pdf',
        },
        quantity: 2,
    },
];

const liveProducts: Product[] = [
    {
        id: 'live-1',
        name: 'Current Bucket',
        category: 'Buckets',
        description: 'Current description',
        weightKg: 320,
        pdfUrl: '/current.pdf',
    },
];

assert.deepEqual(reconcileCartItems(savedItems, liveProducts), [
    {
        product: liveProducts[0],
        quantity: 2,
    },
]);
