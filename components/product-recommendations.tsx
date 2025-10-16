import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductRecommendationsProps {
  products: Product[];
  title?: string;
  description?: string;
}

export default function ProductRecommendations({
  products,
  title = "You May Also Like",
  description,
}: ProductRecommendationsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
