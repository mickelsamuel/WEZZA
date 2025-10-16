"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { getProductBySlug } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Clock } from "lucide-react";

const RECENTLY_VIEWED_KEY = "wezza_recently_viewed";
const MAX_RECENT_PRODUCTS = 8;

interface RecentlyViewedProps {
  currentProductSlug?: string; // Exclude current product if on product page
  limit?: number;
}

export function RecentlyViewed({ currentProductSlug, limit = 4 }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadRecentlyViewed();
  }, [currentProductSlug, limit]);

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!stored) {
        return;
      }

      const slugs: string[] = JSON.parse(stored);
      const products: Product[] = [];

      for (const slug of slugs) {
        // Skip current product
        if (slug === currentProductSlug) {
          continue;
        }

        const product = getProductBySlug(slug);
        if (product) {
          products.push(product);
        }

        // Stop when we have enough products
        if (products.length >= limit) {
          break;
        }
      }

      setRecentProducts(products);
    } catch (error) {
      console.error("Failed to load recently viewed products:", error);
    }
  };

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-brand-orange" />
          <h2 className="font-heading text-3xl font-bold md:text-4xl">Recently Viewed</h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          Pick up where you left off
        </p>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="relative">
        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:overflow-x-visible">
          {recentProducts.map((product) => (
            <div key={product.slug} className="min-w-[280px] md:min-w-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

/**
 * Hook to track product views
 */
export function useTrackProductView(productSlug: string) {
  useEffect(() => {
    if (!productSlug) return;

    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let slugs: string[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists (to move to front)
      slugs = slugs.filter((slug) => slug !== productSlug);

      // Add to front
      slugs.unshift(productSlug);

      // Limit to max products
      if (slugs.length > MAX_RECENT_PRODUCTS) {
        slugs = slugs.slice(0, MAX_RECENT_PRODUCTS);
      }

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(slugs));
    } catch (error) {
      console.error("Failed to track product view:", error);
    }
  }, [productSlug]);
}
