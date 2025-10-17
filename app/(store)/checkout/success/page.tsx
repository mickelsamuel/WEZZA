"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    fetch("/api/site-content?section=checkout")
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

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto h-24 w-24 text-green-500" />
      <h1 className="mt-6 font-heading text-4xl font-bold md:text-5xl">
        {content["checkout.success.title"] || "Order Confirmed!"}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {content["checkout.success.message"] || "Thank you for your purchase. We've sent a confirmation email with your order details."}
      </p>
      <p className="mt-2 text-muted-foreground">
        {content["checkout.success.shipping"] || "Your WEZZA hoodies will be shipped within 1-2 business days."}
      </p>
      <div className="mt-8 space-x-4">
        <Link href="/shop">
          <Button size="lg">
            {content["checkout.success.continueShopping"] || "Continue Shopping"}
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" variant="outline">
            {content["checkout.success.backHome"] || "Back to Home"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
