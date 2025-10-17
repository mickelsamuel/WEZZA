"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import Image from "next/image";

interface WishlistItem {
  id: string;
  productSlug: string;
  product: {
    title: string;
    price: number;
    images: string[];
    inStock: boolean;
    sizes: string[];
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch("/api/site-content?section=wishlist")
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
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error(content["wishlist.toast.failed"] || "Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productSlug: string) => {
    try {
      const response = await fetch(`/api/wishlist?productSlug=${productSlug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWishlist(wishlist.filter((item) => item.productSlug !== productSlug));
        toast.success(content["wishlist.toast.removed"] || "Removed from wishlist");
      }
    } catch (error) {
      toast.error(content["wishlist.toast.removeFailed"] || "Failed to remove item");
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.product.inStock) {
      toast.error(content["wishlist.toast.outOfStock"] || "This item is currently out of stock");
      return;
    }

    // Add with first available size
    const defaultSize = item.product.sizes[0] || "M";
    addItem(
      {
        slug: item.productSlug,
        title: item.product.title,
        price: item.product.price,
        images: item.product.images,
        inStock: item.product.inStock,
        sizes: item.product.sizes,
        description: "",
        fabric: "",
        care: "",
        shipping: "",
        colors: [],
        tags: [],
        currency: "CAD",
        collection: "Core",
        featured: false,
      },
      defaultSize,
      1
    );
    toast.success(content["wishlist.toast.added"] || "Added to cart");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-black via-brand-black to-brand-orange flex items-center justify-center">
        <div className="text-white text-xl">{content["wishlist.loading"] || "Loading..."}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-black via-brand-black to-brand-orange">
      <div className="container mx-auto px-4 py-12">
        {/* Back to Store */}
        <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {content["wishlist.backToStore"] || "Back to Store"}
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Heart className="h-12 w-12 text-brand-orange fill-brand-orange" />
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white">
              {content["wishlist.heading"] || "MY WISHLIST"}
            </h1>
          </div>
          <p className="text-lg text-white/70">
            {wishlist.length} {wishlist.length === 1
              ? (content["wishlist.item"] || "item")
              : (content["wishlist.items"] || "items")} {content["wishlist.savedFor"] || "saved for later"}
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
            <Heart className="h-24 w-24 text-white/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {content["wishlist.empty.title"] || "Your wishlist is empty"}
            </h2>
            <p className="text-white/70 mb-8">
              {content["wishlist.empty.description"] || "Start adding items you love to your wishlist!"}
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90">
                {content["wishlist.empty.button"] || "Browse Products"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card
                key={item.id}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-brand-orange transition-all overflow-hidden"
              >
                <Link href={`/product/${item.productSlug}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.product.images[0] || "/placeholder.png"}
                      alt={item.product.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                    {!item.product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {content["wishlist.outOfStock"] || "OUT OF STOCK"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-6">
                  <Link href={`/product/${item.productSlug}`}>
                    <h3 className="text-xl font-bold text-white mb-2 hover:text-brand-orange transition-colors">
                      {item.product.title}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-brand-orange mb-4">
                    ${(item.product.price / 100).toFixed(2)} CAD
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.product.inStock}
                      className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {content["wishlist.addToCart"] || "Add to Cart"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveFromWishlist(item.productSlug)}
                      className="border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
