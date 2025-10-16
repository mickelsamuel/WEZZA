"use client";

import { useState } from "react";

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
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal());
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 font-heading text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some hoodies to get started
        </p>
        <Link href="/shop">
          <Button size="lg" className="mt-8">
            Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold md:text-5xl">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.product.slug}-${item.size}`} className="p-6">
              <div className="flex gap-6">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-brand-gray"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-heading text-xl font-bold hover:text-brand-orange">
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Size: {item.size} • {item.product.collection}
                    </p>
                    <Price
                      price={item.product.price}
                      currency={item.product.currency}
                      className="mt-2 text-lg font-bold"
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
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <h2 className="font-heading text-2xl font-bold">Order Summary</h2>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <Price price={getTotal} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-sm">
                  {getTotal >= 10000 ? "FREE" : "Calculated at checkout"}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <Price price={getTotal} />
            </div>

            {getTotal < 10000 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Add <Price price={10000 - getTotal} /> more for free shipping
              </p>
            )}

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Secure checkout powered by Stripe
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
