"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/price";
import { QuantitySelector } from "@/components/quantity-selector";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShippingFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export default function CartPage() {
  const router = useRouter();
  const [content, setContent] = useState<Record<string, string>>({});
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal());
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
  });

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

  const handleCheckoutClick = () => {
    setShowCheckoutDialog(true);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout/etransfer", {
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
          shippingAddress: shippingData,
        }),
      });

      const data = await response.json();

      if (data.success && data.orderNumber) {
        // Clear cart
        clearCart();
        // Redirect to order status page
        router.push(`/orders/${data.orderNumber}`);

        if (data.emailSent) {
          toast({
            title: "Order Created!",
            description: `Check your email for payment instructions. Order #${data.orderNumber}`,
          });
        } else {
          toast({
            title: "Order Created!",
            description: `Order #${data.orderNumber} created. Email notification failed - please check your order page for payment details.`,
            variant: "default",
          });
        }
      } else {
        throw new Error(data.error || "Failed to create order");
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

  const handleInputChange = (field: keyof ShippingFormData, value: string) => {
    setShippingData((prev) => ({ ...prev, [field]: value }));
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
              onClick={handleCheckoutClick}
            >
              {content["cart.checkout.button"] || "Proceed to Checkout"}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4">
              {content["cart.checkout.secure"] || "Secure e-transfer payment"}
            </p>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipping Information</DialogTitle>
            <DialogDescription>
              Please provide your shipping details to complete your order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={shippingData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={shippingData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={shippingData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(123) 456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                type="text"
                required
                value={shippingData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  required
                  value={shippingData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Toronto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  type="text"
                  required
                  value={shippingData.province}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="ON"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  type="text"
                  required
                  value={shippingData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="M5H 2N2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  type="text"
                  required
                  value={shippingData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Canada"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">What happens next?</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>You'll receive an email with e-transfer payment instructions</li>
                <li>Send the e-transfer to complete your order</li>
                <li>We'll confirm payment within 24 hours</li>
                <li>Your order will be shipped with free delivery</li>
              </ol>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckoutDialog(false)}
                disabled={isCheckingOut}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCheckingOut}>
                {isCheckingOut ? "Creating Order..." : "Complete Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
