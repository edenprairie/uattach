import type { OrderItem, Product } from './types';

export function reconcileCartItems(items: OrderItem[], products: Product[]) {
    const productsById = new Map(products.map((product) => [product.id, product]));

    return items.flatMap((item) => {
        const currentProduct = productsById.get(item.product.id);

        if (!currentProduct) {
            return [];
        }

        return [{
            ...item,
            product: currentProduct,
        }];
    });
}
