import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Dish } from '@/types';

export interface CartItem {
    dish: Dish;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (dish: Dish, quantity?: number) => void;
    removeItem: (dishId: string) => void;
    updateQuantity: (dishId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = useCallback((dish: Dish, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.dish.id === dish.id);
            if (existing) {
                return prev.map(i =>
                    i.dish.id === dish.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { dish, quantity }];
        });
    }, []);

    const removeItem = useCallback((dishId: string) => {
        setItems(prev => prev.filter(i => i.dish.id !== dishId));
    }, []);

    const updateQuantity = useCallback((dishId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(i => i.dish.id !== dishId));
            return;
        }
        setItems(prev => prev.map(i => i.dish.id === dishId ? { ...i, quantity } : i));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
    const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0), [items]);
    const deliveryFee = subtotal > 0 ? 2.5 : 0;
    const total = subtotal + deliveryFee;

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, deliveryFee, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
