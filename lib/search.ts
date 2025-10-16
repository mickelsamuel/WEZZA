import { Product } from "./types";
import { getAllProducts } from "./products";

export interface SearchResult {
  product: Product;
  matchScore: number;
  matchedIn: ("title" | "description" | "collection" | "color" | "tag")[];
}

/**
 * Search products with ranking algorithm
 */
export function searchProducts(query: string): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchQuery = query.trim().toLowerCase();
  const allProducts = getAllProducts();
  const results: SearchResult[] = [];

  for (const product of allProducts) {
    let matchScore = 0;
    const matchedIn: SearchResult["matchedIn"] = [];

    // Title match (highest weight)
    if (product.title.toLowerCase().includes(searchQuery)) {
      matchScore += 100;
      matchedIn.push("title");
      // Exact match bonus
      if (product.title.toLowerCase() === searchQuery) {
        matchScore += 50;
      }
      // Starts with bonus
      if (product.title.toLowerCase().startsWith(searchQuery)) {
        matchScore += 25;
      }
    }

    // Collection match
    if (product.collection.toLowerCase().includes(searchQuery)) {
      matchScore += 80;
      matchedIn.push("collection");
    }

    // Color match
    const colorMatch = product.colors.some((color) =>
      color.toLowerCase().includes(searchQuery)
    );
    if (colorMatch) {
      matchScore += 60;
      matchedIn.push("color");
    }

    // Tags match
    const tagMatch = product.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery)
    );
    if (tagMatch) {
      matchScore += 40;
      matchedIn.push("tag");
    }

    // Description match (lowest weight)
    if (product.description.toLowerCase().includes(searchQuery)) {
      matchScore += 20;
      matchedIn.push("description");
    }

    // If there's any match, add to results
    if (matchScore > 0) {
      results.push({
        product,
        matchScore,
        matchedIn,
      });
    }
  }

  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get popular search queries (for autocomplete suggestions)
 */
export function getPopularSearches(): string[] {
  return [
    "black",
    "hoodie",
    "core",
    "lunar",
    "custom",
    "peach",
    "white",
    "orange",
    "gray",
  ];
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(query: string): string[] {
  if (!query || query.trim().length < 2) {
    return getPopularSearches().slice(0, 5);
  }

  const searchQuery = query.trim().toLowerCase();
  const allProducts = getAllProducts();
  const suggestions = new Set<string>();

  // Add matching product titles
  allProducts.forEach((product) => {
    if (product.title.toLowerCase().includes(searchQuery)) {
      suggestions.add(product.title);
    }
  });

  // Add matching collections
  const collections = ["Core", "Lunar", "Customizable"];
  collections.forEach((collection) => {
    if (collection.toLowerCase().includes(searchQuery)) {
      suggestions.add(collection);
    }
  });

  // Add matching colors
  const colors = ["black", "white", "peach", "orange", "gray"];
  colors.forEach((color) => {
    if (color.toLowerCase().includes(searchQuery)) {
      suggestions.add(color);
    }
  });

  return Array.from(suggestions).slice(0, 8);
}
