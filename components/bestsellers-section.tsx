"use client";

import { Product } from "@/lib/types";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

interface BestsellersSectionProps {
  limit?: number;
}

export function BestsellersSection({ limit = 4 }: BestsellersSectionProps) {
  // Get products tagged as "bestseller"
  const bestsellers = getAllProducts()
    .filter((product) => product.tags.includes("bestseller") && product.inStock)
    .slice(0, limit);

  // If no bestsellers, show featured products
  const productsToShow = bestsellers.length > 0
    ? bestsellers
    : getAllProducts().filter((p) => p.featured && p.inStock).slice(0, limit);

  if (productsToShow.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-brand-orange" />
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Bestsellers</h2>
          </div>
          <p className="mt-2 text-muted-foreground">
            Our most popular hoodies, loved by the community
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-brand-orange transition-colors hover:underline md:flex"
        >
          Shop All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {productsToShow.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {/* Mobile "Shop All" link */}
      <div className="mt-8 text-center md:hidden">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-brand-orange transition-colors hover:underline"
        >
          Shop All Hoodies
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
