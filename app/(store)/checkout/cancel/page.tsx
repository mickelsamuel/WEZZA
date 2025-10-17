"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  const [content, setContent] = useState<Record<string, string>>({});

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
      <XCircle className="mx-auto h-24 w-24 text-muted-foreground" />
      <h1 className="mt-6 font-heading text-4xl font-bold md:text-5xl">
        {content["checkout.cancel.title"] || "Checkout Cancelled"}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {content["checkout.cancel.message"] || "Your order was not completed. Your cart has been saved."}
      </p>
      <p className="mt-2 text-muted-foreground">
        {content["checkout.cancel.description"] || "Feel free to continue shopping or return to your cart when you're ready."}
      </p>
      <div className="mt-8 space-x-4">
        <Link href="/cart">
          <Button size="lg">
            {content["checkout.cancel.returnToCart"] || "Return to Cart"}
          </Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" variant="outline">
            {content["checkout.cancel.continueShopping"] || "Continue Shopping"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
