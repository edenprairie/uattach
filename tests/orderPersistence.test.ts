import assert from 'node:assert/strict';
import { buildContainerPersistencePlan } from '../src/lib/orderPersistence';

const products = [
    { id: 'bucket', weightKg: 12000 },
    { id: 'fork', weightKg: 5000 },
];

const plan = buildContainerPersistencePlan(
    [
        { productId: 'bucket', quantity: 2 },
        { productId: 'fork', quantity: 1 },
    ],
    products
);

assert.equal(plan.length, 2);
assert.deepEqual(plan, [
    {
        number: 1,
        totalWeightKg: 12000,
        maxWeightKg: 22000,
        items: [{ productId: 'bucket', quantity: 1 }],
    },
    {
        number: 2,
        totalWeightKg: 17000,
        maxWeightKg: 22000,
        items: [
            { productId: 'bucket', quantity: 1 },
            { productId: 'fork', quantity: 1 },
        ],
    },
]);

assert.throws(
    () => buildContainerPersistencePlan([{ productId: 'missing', quantity: 1 }], products),
    /Unknown product ID: missing/
);
