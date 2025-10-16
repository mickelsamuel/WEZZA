import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { AddToCartEnhanced } from "@/components/add-to-cart-enhanced";
import { SizeGuideModal } from "@/components/size-guide-modal";
import { ProductReviews } from "@/components/product-reviews";
import { WishlistButton } from "@/components/wishlist-button";
import { RelatedProducts } from "@/components/related-products";
import { ProductPageClient } from "./product-page-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const productData = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      collection: {
        select: { name: true },
      },
    },
  });

  if (!productData) {
    return {
      title: "Product Not Found",
    };
  }

  const images = (productData.images as string[]) || [];

  return {
    title: `${productData.title} | WEZZA`,
    description: productData.description,
    openGraph: {
      title: productData.title,
      description: productData.description,
      images: images.length > 0 ? [images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const productData = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      collection: {
        select: { name: true },
      },
    },
  });

  if (!productData) {
    notFound();
  }

  // Transform to match Product type
  const product = {
    slug: productData.slug,
    title: productData.title,
    description: productData.description,
    price: productData.price,
    currency: productData.currency,
    collection: (productData.collection?.name || "Core") as "Core" | "Lunar" | "Customizable",
    images: (productData.images as string[]) || [],
    inStock: productData.inStock,
    featured: productData.featured,
    fabric: productData.fabric,
    care: productData.care,
    shipping: productData.shipping,
    sizes: (productData.sizes as string[]) || [],
    colors: (productData.colors as string[]) || [],
    tags: (productData.tags as string[]) || [],
  };

  return (
    <ProductPageClient product={product}>
      <div className="container mx-auto px-4 py-12">
      <Link href="/shop">
        <Button variant="ghost" className="mb-8">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-gray">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.slice(1).map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg bg-brand-gray"
              >
                <Image
                  src={image}
                  alt={`${product.title} - view ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {product.collection}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold md:text-5xl">{product.title}</h1>
          <div className="mt-4 flex items-center gap-2">
            <Price price={product.price} currency={product.currency} className="text-3xl font-bold" />
            {!product.inStock && (
              <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
                Out of Stock
              </span>
            )}
          </div>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6">
            <SizeGuideModal />
          </div>

          <div className="mt-6 space-y-3">
            <AddToCartEnhanced product={product} />
            <WishlistButton productSlug={product.slug} />
          </div>

          {/* Product Details Accordion */}
          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="fabric">
                <AccordionTrigger className="text-lg font-semibold">
                  Fabric & Construction
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {product.fabric}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="text-lg font-semibold">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {product.care}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-lg font-semibold">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {product.shipping}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="mt-20 border-t pt-12">
        <h2 className="mb-8 font-heading text-3xl font-bold">Customer Reviews</h2>
        <ProductReviews productSlug={product.slug} />
      </div>

      {/* Related Products */}
      <div className="mt-20 border-t">
        <RelatedProducts product={product} />
      </div>
    </div>
    </ProductPageClient>
  );
}
