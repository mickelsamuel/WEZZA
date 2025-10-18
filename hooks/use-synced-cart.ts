"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { CartItem } from "@/lib/types";

/**
 * Hook to sync cart with database for authenticated users
 * - Loads cart from DB on login
 * - Syncs cart changes to DB for authenticated users
 * - Falls back to localStorage for guests
 * - Clears cart when user changes or logs out
 */
export function useSyncedCart() {
  const { data: session, status } = useSession();
  const cart = useCartStore();
  const previousUserIdRef = useRef<string | null>(null);

  // Handle user changes and logout - clear cart when user changes
  useEffect(() => {
    const currentUserId = session?.user?.id || null;

    // If user changed (including logout), clear the cart
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== currentUserId) {
      cart.clearCart();
    }

    // Update the previous user ID
    previousUserIdRef.current = currentUserId;
  }, [session?.user?.id]);

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
          // Use ONLY database cart for logged-in users
          // This prevents cart contamination from previous users in localStorage
          const dbItems: CartItem[] = dbCart.items;

          // Replace local cart with database cart
          useCartStore.setState({ items: dbItems });
        } else {
          // No cart in database, clear local cart
          useCartStore.setState({ items: [] });
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
