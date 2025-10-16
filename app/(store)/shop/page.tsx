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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [collectionFilters, setCollectionFilters] = useState<string[]>([]);

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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">Shop All Hoodies</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"} available
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-xl font-bold">Filters</h2>
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
              <p className="text-muted-foreground">Loading products...</p>
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
    <Suspense fallback={<div className="container mx-auto px-4 py-12">Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
