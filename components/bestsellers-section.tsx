"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

interface BestsellersSectionProps {
  limit?: number;
}

export function BestsellersSection({ limit = 4 }: BestsellersSectionProps) {
  const [productsToShow, setProductsToShow] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=bestsellers")
      .then((res) => res.json())
      .then((data) => {
        const contentMap: Record<string, string> = {};
        data.content?.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }, []);

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        setLoading(true);
        const response = await fetch("/api/products?inStock=true");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const allProducts: Product[] = data.products || [];

        // Get products tagged as "bestseller"
        const bestsellers = allProducts
          .filter((product) => product.tags.includes("bestseller"))
          .slice(0, limit);

        // If no bestsellers, show featured products
        const products = bestsellers.length > 0
          ? bestsellers
          : allProducts.filter((p) => p.featured).slice(0, limit);

        setProductsToShow(products);
      } catch (error) {
        console.error("Failed to fetch bestsellers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBestsellers();
  }, [limit]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-orange" />
        </div>
      </section>
    );
  }

  if (productsToShow.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-brand-orange" />
            <h2 className="font-heading text-3xl font-bold md:text-4xl">{content["bestsellers.heading"] || "Bestsellers"}</h2>
          </div>
          <p className="mt-2 text-muted-foreground">
            {content["bestsellers.description"] || "Our most popular hoodies, loved by the community"}
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-brand-orange transition-colors hover:underline md:flex"
        >
          {content["bestsellers.shopAll"] || "Shop All"}
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
          {content["bestsellers.shopAllHoodies"] || "Shop All Hoodies"}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
