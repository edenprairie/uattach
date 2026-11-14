import type { Product } from '@/lib/types';

const bucketWeightsLb = [535, 574, 626, 666, 719];
const bucketSizes = ['62" STD', '68" STD', '74" STD', '80" STD', '84" STD'];

export const SAMPLE_CATALOG_URL = '/api/catalog/sample';
export const SAMPLE_CATALOG_PREVIEW_URL = '/catalog/standard-low-pro-bucket-preview.webp';

export const SAMPLE_PRODUCTS: Product[] = bucketSizes.map((size, index) => ({
    id: `standard-low-pro-${size.slice(0, 2)}`.toLowerCase(),
    name: `Standard Low Pro Bucket - ${size}`,
    category: 'Skid Steer Buckets',
    description: 'Standard low profile bucket with bolt-on cutting edge.',
    weightKg: Number((bucketWeightsLb[index] * 0.45359237).toFixed(1)),
    pdfUrl: SAMPLE_CATALOG_URL,
    imageUrl: SAMPLE_CATALOG_PREVIEW_URL,
    features: [
        'Reinforced 54-inch dimple plate',
        '3/4-inch x 6-inch weld-on cutting edge',
        'Weight shown with bolt-on cutting edge',
    ],
}));
