import productsData from "@/data/products.json";
import { Product } from "./types";

export const products: Product[] = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCollection(collection: string): Product[] {
  return products.filter((p) => p.collection === collection);
}

export function getProductsByColor(color: string): Product[] {
  return products.filter((p) => p.colors.includes(color));
}

export function getRelatedProducts(product: Product, limit: number = 3): Product[] {
  return products
    .filter((p) => p.slug !== product.slug && p.collection === product.collection)
    .slice(0, limit);
}

export interface FilterOptions {
  colors?: string[];
  sizes?: string[];
  collections?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export function filterProducts(options: FilterOptions): Product[] {
  let filtered = [...products];

  if (options.colors && options.colors.length > 0) {
    filtered = filtered.filter((p) => p.colors.some((c) => options.colors!.includes(c)));
  }

  if (options.sizes && options.sizes.length > 0) {
    filtered = filtered.filter((p) => p.sizes.some((s) => options.sizes!.includes(s)));
  }

  if (options.collections && options.collections.length > 0) {
    filtered = filtered.filter((p) => options.collections!.includes(p.collection));
  }

  if (options.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.inStock !== undefined) {
    filtered = filtered.filter((p) => p.inStock === options.inStock);
  }

  return filtered;
}

export type SortOption = "newest" | "price-low" | "price-high";

export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
    default:
      return sorted;
  }
}
