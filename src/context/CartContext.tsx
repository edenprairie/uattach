"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Container } from '@/lib/types';
import { calculateContainers, validateOrder } from '@/lib/containerLogic';

interface CartContextType {
    items: OrderItem[];
    containers: Container[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    validation: { valid: boolean; message?: string };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [validation, setValidation] = useState<{ valid: boolean; message?: string }>({ valid: true });

    // Recalculate containers whenever items change
    useEffect(() => {
        const newContainers = calculateContainers(items);
        setContainers(newContainers);
        setValidation(validateOrder(newContainers));
    }, [items]);

    const addToCart = (product: Product, quantity: number) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
        ));
    };

    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider value={{
            items,
            containers,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            validation
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
