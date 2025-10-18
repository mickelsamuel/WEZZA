"use client";

import { useState, useEffect, Suspense } from "react";

export const dynamic = "force-dynamic";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { Filters } from "@/components/filters";
import { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";

type SortOption = "newest" | "price-low" | "price-high";

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [collectionFilters, setCollectionFilters] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/site-content?section=shop")
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
    const collection = searchParams.get("collection");
    if (collection) {
      setCollectionFilters([collection]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [colorFilters, sizeFilters, collectionFilters, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (collectionFilters.length > 0) {
        params.append("collection", collectionFilters[0]);
      }
      if (colorFilters.length > 0) {
        params.append("colors", colorFilters.join(","));
      }
      if (sizeFilters.length > 0) {
        params.append("sizes", sizeFilters.join(","));
      }
      params.append("sort", sortBy);
      params.append("inStock", "true");

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setColorFilters([]);
    setSizeFilters([]);
    setCollectionFilters([]);
    setSortBy("newest");
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
          {content["shop.pageTitle"] || "Shop All Hoodies"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {products.length} {products.length === 1
            ? (content["shop.productCount.singular"] || "product")
            : (content["shop.productCount.plural"] || "products")} {content["shop.productCount.available"] || "available"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="p-4 sm:p-6">
            <h2 className="mb-3 font-heading text-lg font-bold sm:mb-4 sm:text-xl">
              {content["shop.filters.title"] || "Filters"}
            </h2>
            <Filters
              onColorChange={setColorFilters}
              onSizeChange={setSizeFilters}
              onCollectionChange={setCollectionFilters}
              onSortChange={setSortBy}
              onReset={handleReset}
            />
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground sm:text-base">
                {content["shop.loading"] || "Loading products..."}
              </p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
