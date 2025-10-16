import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartState, CartItem, Product } from "@/lib/types";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, size: string, quantity: number) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.slug === product.slug && item.size === size
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [...state.items, { product, size, quantity }],
          };
        });
      },

      removeItem: (productSlug: string, size: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.slug === productSlug && item.size === size)
          ),
        }));
      },

      updateQuantity: (productSlug: string, size: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productSlug, size);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.slug === productSlug && item.size === size
              ? { ...item, quantity }
              : item
          );
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          return total + item.product.price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "wezza-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
