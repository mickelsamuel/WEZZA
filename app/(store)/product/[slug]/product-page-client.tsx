"use client";

import { useEffect } from "react";
import { Product } from "@/lib/types";
import { useTrackProductView } from "@/components/recently-viewed";

interface ProductPageClientProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductPageClient({ product, children }: ProductPageClientProps) {
  // Track product view
  useTrackProductView(product.slug);

  return <>{children}</>;
}
