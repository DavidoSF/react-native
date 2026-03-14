import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CartItem, Dish } from '@/types';
import { storage, STORAGE_KEYS } from '@/services/storage';

type CartContextType = {
  items: CartItem[];
  isHydrated: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  lastAddedAt: number | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    storage.getItem<CartItem[]>(STORAGE_KEYS.CART).then((saved) => {
      if (!isMounted) return;
      setItems(saved ?? []);
      setIsHydrated(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    storage.setItem(STORAGE_KEYS.CART, items);
  }, [items, isHydrated]);

  const addItem = useCallback((dish: Dish, quantity = 1) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { dish, quantity }];
    });
    setLastAddedAt(Date.now());
  }, []);

  const removeItem = useCallback((dishId: string) => {
    setItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  }, []);

  const updateQuantity = useCallback((dishId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.dish.id !== dishId);
      }
      return prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const { totalItems, subtotal } = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalValue = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    return { totalItems: total, subtotal: subtotalValue };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      lastAddedAt,
    }),
    [items, isHydrated, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart, lastAddedAt]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
