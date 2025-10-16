"use client";

import { AlertCircle, Package } from "lucide-react";
import { Product } from "@/lib/types";

interface StockIndicatorProps {
  product: Product;
  selectedSize?: string;
}

export function StockIndicator({ product, selectedSize }: StockIndicatorProps) {
  // If no stock data, just show basic in stock status
  if (!product.stockBySize && !product.totalStock) {
    return product.inStock ? (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Package className="h-4 w-4" />
        <span>In Stock</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Out of Stock</span>
      </div>
    );
  }

  // If size is selected and we have size-specific stock data
  if (selectedSize && product.stockBySize && product.stockBySize[selectedSize] !== undefined) {
    const stock = product.stockBySize[selectedSize];

    if (stock === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Out of Stock in {selectedSize}</span>
        </div>
      );
    }

    if (stock <= 5) {
      return (
        <div className="flex items-center gap-2 text-sm text-orange-600">
          <AlertCircle className="h-4 w-4" />
          <span>Only {stock} left in {selectedSize}!</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Package className="h-4 w-4" />
        <span>In Stock</span>
      </div>
    );
  }

  // Show total stock if available
  if (product.totalStock !== undefined) {
    if (product.totalStock === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Out of Stock</span>
        </div>
      );
    }

    if (product.totalStock <= 10) {
      return (
        <div className="flex items-center gap-2 text-sm text-orange-600">
          <AlertCircle className="h-4 w-4" />
          <span>Only {product.totalStock} left!</span>
        </div>
      );
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <Package className="h-4 w-4" />
      <span>In Stock</span>
    </div>
  );
}

// Helper function to check if a specific size is in stock
export function isSizeInStock(product: Product, size: string): boolean {
  if (!product.inStock) return false;
  if (!product.stockBySize) return true; // If no size-specific data, assume in stock
  return (product.stockBySize[size] || 0) > 0;
}

// Helper function to get stock for a specific size
export function getSizeStock(product: Product, size: string): number | null {
  if (!product.stockBySize) return null;
  return product.stockBySize[size] || 0;
}
