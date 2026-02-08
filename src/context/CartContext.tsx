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
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('uattach-cart');
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsLoaded(true);
    }, []);
    // Derived state
    const containers = React.useMemo(() => calculateContainers(items), [items]);
    const validation = React.useMemo(() => validateOrder(containers), [containers]);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('uattach-cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);



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
        setIsCartOpen(true); // Open cart when adding item
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
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider value={{
            items,
            containers,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            validation,
            isCartOpen,
            openCart,
            closeCart
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
