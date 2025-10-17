"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=productGrid")
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

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-muted-foreground">
          {content["productGrid.empty"] || "No products found matching your criteria."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
