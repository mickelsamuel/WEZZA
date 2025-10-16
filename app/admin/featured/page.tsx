"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  featured: boolean;
  inStock: boolean;
  collection: {
    name: string;
  } | null;
}

export default function FeaturedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentStatus }),
      });

      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === productId ? { ...p, featured: !currentStatus } : p
          )
        );
        toast.success(
          !currentStatus
            ? "Added to featured products"
            : "Removed from featured products"
        );
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setUpdating(null);
    }
  };

  const featuredProducts = products.filter((p) => p.featured);
  const availableProducts = products.filter((p) => !p.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Featured Products</h1>
          <p className="text-gray-600 mt-1">
            Manage which products appear in the "Featured Hoodies" section on your homepage
          </p>
        </div>
      </div>

      {/* Currently Featured */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-brand-orange fill-brand-orange" />
            Currently Featured ({featuredProducts.length})
          </CardTitle>
          <CardDescription>
            These products are displayed on your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No featured products yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Click the star icon on any product below to feature it
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={product.images[0] || "/placeholder.png"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className="absolute top-2 right-2 bg-brand-orange"
                    >
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.collection?.name || "No Collection"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-brand-orange">
                        ${(product.price / 100).toFixed(2)} {product.currency}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(product.id, product.featured)}
                        disabled={updating === product.id}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        {updating === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-1 fill-current" />
                            Unfeature
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Products */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products ({availableProducts.length})</CardTitle>
          <CardDescription>
            Select products to feature on your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">All products are featured!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={product.images[0] || "/placeholder.png"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    {!product.inStock && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.collection?.name || "No Collection"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-brand-orange">
                        ${(product.price / 100).toFixed(2)} {product.currency}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(product.id, product.featured)}
                        disabled={updating === product.id}
                        className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
                      >
                        {updating === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-1" />
                            Feature
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                💡
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Pro Tip</h3>
              <p className="text-sm text-blue-800">
                Featured products appear in the "Featured Hoodies" section on your homepage.
                Choose your best-selling or newest products to showcase to visitors.
                Changes take effect immediately on the homepage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
