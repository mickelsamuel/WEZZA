import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/price";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-brand-gray">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.tags.includes("new") && (
            <span className="absolute right-3 top-3 rounded-md bg-brand-orange px-2 py-1 text-xs font-semibold text-white">
              NEW
            </span>
          )}
          {product.tags.includes("bestseller") && (
            <span className="absolute left-3 top-3 rounded-md bg-brand-black px-2 py-1 text-xs font-semibold text-white">
              BESTSELLER
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.collection}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold">{product.title}</h3>
          <div className="mt-2 flex items-center justify-between">
            <Price price={product.price} currency={product.currency} className="text-lg font-bold" />
            {!product.inStock && (
              <span className="text-xs text-red-600">Out of Stock</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
