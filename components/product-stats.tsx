"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Eye, TrendingUp, Package, Star } from "lucide-react";

interface ProductStats {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  inStockStatus: boolean;
  currency: string;
}

interface ProductStatsProps {
  productId?: string;
  productSlug?: string;
  productTitle: string;
}

export function ProductStats({ productId, productSlug, productTitle }: ProductStatsProps) {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [productId, productSlug]);

  const loadStats = async () => {
    try {
      const identifier = productId || productSlug;
      const queryParam = productId ? `id=${productId}` : `slug=${productSlug}`;

      const response = await fetch(`/api/product-stats?${queryParam}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load product stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Analytics</CardTitle>
          <CardDescription>Loading statistics for "{productTitle}"...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Analytics</CardTitle>
        <CardDescription>Performance metrics for "{productTitle}"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(stats.totalRevenue / 100).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{stats.currency}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Total Orders */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">{stats.totalUnits} units sold</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Average Rating */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
                </p>
                <p className="text-xs text-gray-500">{stats.reviewCount} reviews</p>
              </div>
              <Star className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </div>

          {/* View Count (placeholder) */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Product Views</p>
                <p className="text-2xl font-bold text-purple-600">{stats.viewCount || 0}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <Eye className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </div>

          {/* Stock Status */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Status</p>
                <p className={`text-2xl font-bold ${stats.inStockStatus ? "text-green-600" : "text-red-600"}`}>
                  {stats.inStockStatus ? "In Stock" : "Out of Stock"}
                </p>
                <p className="text-xs text-gray-500">Current status</p>
              </div>
              <Package className="h-10 w-10 text-gray-600 opacity-20" />
            </div>
          </div>

          {/* Average Order Value */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalOrders > 0
                    ? `$${(stats.totalRevenue / stats.totalOrders / 100).toFixed(2)}`
                    : "$0.00"}
                </p>
                <p className="text-xs text-gray-500">Per order</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
