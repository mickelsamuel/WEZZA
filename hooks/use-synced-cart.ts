"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { CartItem } from "@/lib/types";

/**
 * Hook to sync cart with database for authenticated users
 * - Loads cart from DB on login
 * - Syncs cart changes to DB for authenticated users
 * - Falls back to localStorage for guests
 */
export function useSyncedCart() {
  const { data: session, status } = useSession();
  const cart = useCartStore();

  // Load cart from database when user logs in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      loadCartFromDatabase();
    }
  }, [status, session?.user?.id]);

  // Sync cart to database whenever it changes (for authenticated users)
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      syncCartToDatabase();
    }
  }, [cart.items, status, session?.user?.id]);

  const loadCartFromDatabase = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const { cart: dbCart } = await response.json();
        if (dbCart && dbCart.items) {
          // Merge local cart with database cart
          const localItems: CartItem[] = cart.items;
          const dbItems: CartItem[] = dbCart.items;

          // Create a map to merge items
          const mergedItemsMap = new Map<string, CartItem>();

          // Add local items
          localItems.forEach((item) => {
            const key = `${item.product.slug}-${item.size}`;
            mergedItemsMap.set(key, item);
          });

          // Merge with database items (db items take precedence for quantity)
          dbItems.forEach((item) => {
            const key = `${item.product.slug}-${item.size}`;
            const existing = mergedItemsMap.get(key);
            if (existing) {
              // Keep the higher quantity
              mergedItemsMap.set(key, {
                ...item,
                quantity: Math.max(existing.quantity, item.quantity),
              });
            } else {
              mergedItemsMap.set(key, item);
            }
          });

          // Update local cart with merged items
          const mergedItems = Array.from(mergedItemsMap.values());
          useCartStore.setState({ items: mergedItems });

          // Sync merged cart back to database
          await syncCartToDatabase(mergedItems);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from database:", error);
    }
  };

  const syncCartToDatabase = async (items?: CartItem[]) => {
    try {
      const cartItems = items || cart.items;
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });
    } catch (error) {
      console.error("Failed to sync cart to database:", error);
    }
  };

  return cart;
}
