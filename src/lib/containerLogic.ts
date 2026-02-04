import { OrderItem, Container } from '@/lib/types';
import { CONTAINER_MAX_WEIGHT_KG, CONTAINER_MIN_WEIGHT_KG } from '@/lib/constants';

export function calculateContainers(items: OrderItem[]): Container[] {
    const containers: Container[] = [];

    // Flatten all items into unit chunks for simple packing (knapsack problem in reality, but we'll do greedy for now)
    // Since we can split quantities of same product? "split into the next container" implies we can put 5 buckets in C1 and 5 in C2.

    let currentContainerWeight = 0;
    let currentContainerItems: OrderItem[] = [];

    // We need to iterate through items and fill containers
    // Clone items to avoid mutating original order
    const remainingItems = items.map(i => ({ ...i }));

    for (const item of remainingItems) {
        let quantityResult = item.quantity;
        const unitWeight = item.product.weightKg;

        while (quantityResult > 0) {
            // Check how many fits in current container
            const remainingWeightInContainer = CONTAINER_MAX_WEIGHT_KG - currentContainerWeight;
            const maxUnitsFit = Math.floor(remainingWeightInContainer / unitWeight);

            const unitsToTake = Math.min(quantityResult, maxUnitsFit);

            if (unitsToTake > 0) {
                // Add to current container
                const existingItemIndex = currentContainerItems.findIndex(i => i.product.id === item.product.id);
                if (existingItemIndex >= 0) {
                    currentContainerItems[existingItemIndex].quantity += unitsToTake;
                } else {
                    currentContainerItems.push({
                        product: item.product,
                        quantity: unitsToTake
                    });
                }

                currentContainerWeight += unitsToTake * unitWeight;
                quantityResult -= unitsToTake;
            }

            // If container is full (or we couldn't fit even one unit and container has stuff), close it
            if (currentContainerWeight >= CONTAINER_MAX_WEIGHT_KG || (unitsToTake === 0 && quantityResult > 0)) {
                // Push current container
                containers.push({
                    id: `cnt-${containers.length + 1}`,
                    items: currentContainerItems,
                    totalWeightKg: currentContainerWeight,
                    maxWeightKg: CONTAINER_MAX_WEIGHT_KG,
                    number: containers.length + 1
                });

                // Reset for next container
                currentContainerItems = [];
                currentContainerWeight = 0;
            }
        }
    }

    // Push the last partially filled container if exists
    if (currentContainerItems.length > 0) {
        containers.push({
            id: `cnt-${containers.length + 1}`,
            items: currentContainerItems,
            totalWeightKg: currentContainerWeight,
            maxWeightKg: CONTAINER_MAX_WEIGHT_KG,
            number: containers.length + 1
        });
    }

    return containers;
}

export function validateOrder(containers: Container[]): { valid: boolean; message?: string } {
    if (containers.length === 0) return { valid: false, message: 'Cart is empty' };

    const lastContainer = containers[containers.length - 1];
    if (lastContainer.totalWeightKg < CONTAINER_MIN_WEIGHT_KG) {
        return {
            valid: false,
            message: `Last container is under minimum weight (${lastContainer.totalWeightKg}kg / ${CONTAINER_MIN_WEIGHT_KG}kg required). Add more items.`
        };
    }

    return { valid: true };
}
