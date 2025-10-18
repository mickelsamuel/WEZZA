"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/price";
import { QuantitySelector } from "@/components/quantity-selector";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CartPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal());
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetch("/api/site-content?section=cart")
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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.product.slug,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      toast({
        title: content["cart.error.title"] || "Checkout Error",
        description: error instanceof Error ? error.message : (content["cart.error.description"] || "An error occurred"),
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center sm:py-20">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground sm:h-24 sm:w-24" />
        <h1 className="mt-4 font-heading text-2xl font-bold sm:mt-6 sm:text-3xl">
          {content["cart.empty.title"] || "Your cart is empty"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {content["cart.empty.description"] || "Add some hoodies to get started"}
        </p>
        <Link href="/shop">
          <Button size="lg" className="mt-6 w-full sm:mt-8 sm:w-auto">
            {content["cart.empty.button"] || "Shop Now"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="mb-6 font-heading text-3xl font-bold sm:mb-8 sm:text-4xl md:text-5xl">
        {content["cart.pageTitle"] || "Shopping Cart"}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Cart Items */}
        <div className="space-y-3 sm:space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={`${item.product.slug}-${item.size}`} className="p-4 sm:p-6">
              <div className="flex gap-4 sm:gap-6">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-gray sm:h-32 sm:w-32"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-heading text-base font-bold hover:text-brand-orange sm:text-xl">
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {content["cart.item.size"] || "Size"}: {item.size} • {item.product.collection}
                    </p>
                    <Price
                      price={item.product.price}
                      currency={item.product.currency}
                      className="mt-2 text-base font-bold sm:text-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <QuantitySelector
                      quantity={item.quantity}
                      onQuantityChange={(qty) =>
                        updateQuantity(item.product.slug, item.size, qty)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.slug, item.size)}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">
              {content["cart.summary.title"] || "Order Summary"}
            </h2>

            <Separator className="my-3 sm:my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-muted-foreground">
                  {content["cart.summary.subtotal"] || "Subtotal"}
                </span>
                <Price price={getTotal} />
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-muted-foreground">
                  {content["cart.summary.shipping"] || "Shipping"}
                </span>
                <span className="text-xs sm:text-sm">
                  {getTotal >= 10000
                    ? (content["cart.summary.shipping.free"] || "FREE")
                    : (content["cart.summary.shipping.calculated"] || "Calculated at checkout")}
                </span>
              </div>
            </div>

            <Separator className="my-3 sm:my-4" />

            <div className="flex justify-between text-base font-bold sm:text-lg">
              <span>{content["cart.summary.total"] || "Total"}</span>
              <Price price={getTotal} />
            </div>

            {getTotal < 10000 && (
              <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                {content["cart.summary.freeShippingMessage"] || "Add"} <Price price={10000 - getTotal} /> {content["cart.summary.freeShippingMessage2"] || "more for free shipping"}
              </p>
            )}

            <Button
              size="lg"
              className="mt-4 w-full sm:mt-6"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut
                ? (content["cart.checkout.processing"] || "Processing...")
                : (content["cart.checkout.button"] || "Proceed to Checkout")}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4">
              {content["cart.checkout.secure"] || "Secure checkout powered by Stripe"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
