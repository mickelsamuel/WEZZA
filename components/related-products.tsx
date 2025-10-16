import { Product } from "@/lib/types";
import { getRelatedProducts } from "@/lib/recommendations";
import { ProductCard } from "@/components/product-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RelatedProductsProps {
  product: Product;
  limit?: number;
}

export async function RelatedProducts({ product, limit = 4 }: RelatedProductsProps) {
  // Get user session for personalization
  const session = await getServerSession(authOptions);

  // Get related products using the recommendation engine
  const relatedProducts = await getRelatedProducts(product.slug, limit);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold md:text-4xl">You May Also Like</h2>
          <p className="mt-2 text-muted-foreground">
            More from the {product.collection} collection
          </p>
        </div>
        <Link
          href={`/shop?collection=${product.collection}`}
          className="hidden items-center gap-1 text-brand-orange transition-colors hover:underline md:flex"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:overflow-x-visible">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.slug} className="min-w-[280px] md:min-w-0">
              <ProductCard product={relatedProduct} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile "View All" link */}
      <div className="mt-6 text-center md:hidden">
        <Link
          href={`/shop?collection=${product.collection}`}
          className="inline-flex items-center gap-1 text-brand-orange transition-colors hover:underline"
        >
          View All {product.collection}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
