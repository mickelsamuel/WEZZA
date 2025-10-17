import Link from "next/link";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { InstagramStrip } from "@/components/instagram-strip";
import { getPersonalizedRecommendations } from "@/lib/recommendations";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductRecommendations from "@/components/product-recommendations";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const VALUE_PROPS = [
  {
    icon: Sparkles,
    title: "Premium Cotton",
    description: "350gsm heavyweight fabric that gets better with every wash",
  },
  {
    icon: TrendingUp,
    title: "Bold Fits",
    description: "Modern silhouettes designed for everyday confidence",
  },
  {
    icon: Shield,
    title: "Clean Looks",
    description: "Minimalist designs that never go out of style",
  },
];

export default async function HomePage() {
  // Get featured products from database
  const featuredProductsData = await prisma.product.findMany({
    where: { featured: true },
    include: {
      collection: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform to match Product type
  const featuredProducts = featuredProductsData.map((p: any) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    price: p.price,
    currency: p.currency,
    collection: (p.collection?.name || "Core") as "Core" | "Lunar" | "Customizable",
    images: (p.images as string[]) || [],
    inStock: p.inStock,
    featured: p.featured,
    fabric: p.fabric,
    care: p.care,
    shipping: p.shipping,
    sizes: (p.sizes as string[]) || [],
    colors: (p.colors as string[]) || [],
    tags: (p.tags as string[]) || [],
  }));

  // Get personalized recommendations for logged-in users
  const session = await getServerSession(authOptions);
  let personalizedProducts = null;
  if (session?.user?.id) {
    personalizedProducts = await getPersonalizedRecommendations(
      session.user.id,
      4
    );
  }

  return (
    <>
      <Hero />

      {/* Personalized Recommendations (for logged-in users) */}
      {personalizedProducts && personalizedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ProductRecommendations
              products={personalizedProducts}
              title="Picked Just For You"
              description="Based on your browsing and purchase history"
            />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Featured Hoodies</h2>
            <p className="mt-2 text-muted-foreground">Our most popular styles</p>
          </div>
          <ProductGrid products={featuredProducts} />
          <div className="mt-12 text-center">
            <Link href="/shop">
              <Button size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-brand-peach/20 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Made For Daily Wear</h2>
            <p className="mt-2 text-muted-foreground">
              Every detail matters when you're building something to last
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange text-white">
                  <prop.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold">{prop.title}</h3>
                <p className="mt-2 text-muted-foreground">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InstagramStrip />
    </>
  );
}
