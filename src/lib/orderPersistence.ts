import { CONTAINER_MAX_WEIGHT_KG } from './constants';

export interface SubmittedOrderItem {
    productId: string;
    quantity: number;
}

export interface ProductWeight {
    id: string;
    weightKg: number;
}

export interface ContainerPersistencePlan {
    number: number;
    totalWeightKg: number;
    maxWeightKg: number;
    items: SubmittedOrderItem[];
}

export function buildContainerPersistencePlan(
    items: SubmittedOrderItem[],
    products: ProductWeight[]
): ContainerPersistencePlan[] {
    const productWeights = new Map(products.map((product) => [product.id, product.weightKg]));
    const containers: ContainerPersistencePlan[] = [];

    let currentContainerWeight = 0;
    let currentContainerItems: SubmittedOrderItem[] = [];

    for (const item of items) {
        const unitWeight = productWeights.get(item.productId);

        if (unitWeight === undefined) {
            throw new Error(`Unknown product ID: ${item.productId}`);
        }

        if (unitWeight > CONTAINER_MAX_WEIGHT_KG) {
            throw new Error(`Product ${item.productId} exceeds the container maximum weight`);
        }

        let remainingQuantity = item.quantity;

        while (remainingQuantity > 0) {
            const remainingWeightInContainer = CONTAINER_MAX_WEIGHT_KG - currentContainerWeight;
            const maxUnitsFit = Math.floor(remainingWeightInContainer / unitWeight);
            const unitsToTake = Math.min(remainingQuantity, maxUnitsFit);

            if (unitsToTake > 0) {
                const existingItem = currentContainerItems.find((containerItem) => (
                    containerItem.productId === item.productId
                ));

                if (existingItem) {
                    existingItem.quantity += unitsToTake;
                } else {
                    currentContainerItems.push({
                        productId: item.productId,
                        quantity: unitsToTake,
                    });
                }

                currentContainerWeight += unitsToTake * unitWeight;
                remainingQuantity -= unitsToTake;
            }

            if (currentContainerWeight >= CONTAINER_MAX_WEIGHT_KG || (unitsToTake === 0 && remainingQuantity > 0)) {
                containers.push({
                    number: containers.length + 1,
                    totalWeightKg: currentContainerWeight,
                    maxWeightKg: CONTAINER_MAX_WEIGHT_KG,
                    items: currentContainerItems,
                });

                currentContainerItems = [];
                currentContainerWeight = 0;
            }
        }
    }

    if (currentContainerItems.length > 0) {
        containers.push({
            number: containers.length + 1,
            totalWeightKg: currentContainerWeight,
            maxWeightKg: CONTAINER_MAX_WEIGHT_KG,
            items: currentContainerItems,
        });
    }

    return containers;
}
