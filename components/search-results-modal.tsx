"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  product: Product;
  matchScore: number;
  matchedIn: string[];
}

interface SearchResultsModalProps {
  query: string;
  onClose: () => void;
}

export function SearchResultsModal({ query, onClose }: SearchResultsModalProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=searchResults")
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
    if (query.trim()) {
      searchProducts(query);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Failed to search products. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = async (productSlug: string) => {
    // Log the click for analytics
    try {
      await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, productSlug }),
      });
    } catch (error) {
      console.error("Failed to log search click:", error);
    }

    onClose();
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold">
          {content["searchResults.heading"] || "Search Results"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? (
            content["searchResults.loading"] || "Searching..."
          ) : results.length > 0 ? (
            <>
              Found {results.length} {results.length === 1 ? (content["searchResults.singular"] || "result") : (content["searchResults.plural"] || "results")} for &quot;{query}&quot;
            </>
          ) : (
            <>{content["searchResults.noResults"] || "No results found"} for &quot;{query}&quot;</>
          )}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <div key={result.product.slug} onClick={() => handleProductClick(result.product.slug)}>
              <ProductCard product={result.product} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {content["searchResults.noMatch"] || "No products match your search. Try different keywords."}
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              onClick={onClose}
              className="inline-block rounded-md bg-brand-black px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange"
            >
              {content["searchResults.browseAll"] || "Browse All Products"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
