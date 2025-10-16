"use client";

import { useSyncedCart } from "@/hooks/use-synced-cart";

/**
 * Component to initialize cart synchronization
 * This component should be placed in the root layout
 * It doesn't render anything, just initializes the sync
 */
export function CartSync() {
  useSyncedCart();
  return null;
}
