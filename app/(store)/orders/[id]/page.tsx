"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface OrderItem {
  slug: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: string;
  items: OrderItem[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

const getStatusSteps = (content: Record<string, string>) => [
  { key: "pending", label: content["orders.status.pending"] || "Order Placed", icon: "📦" },
  { key: "processing", label: content["orders.status.processing"] || "Processing", icon: "⚙️" },
  { key: "shipped", label: content["orders.status.shipped"] || "Shipped", icon: "🚚" },
  { key: "delivered", label: content["orders.status.delivered"] || "Delivered", icon: "✅" },
];

const statusColors = {
  pending: "warning",
  processing: "default",
  shipped: "default",
  delivered: "success",
  completed: "success",
  cancelled: "destructive",
} as const;

export default function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=orders")
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
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = getStatusSteps(content);

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex((step) => step.key === order.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{content["orders.notFound.title"] || "Order Not Found"}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/account"
            className="text-brand-orange hover:underline"
          >
            {content["orders.notFound.viewAll"] || "View all orders"}
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-brand-orange hover:underline mb-4 inline-block"
          >
            {content["orders.backToAccount"] || "← Back to Account"}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{content["orders.pageTitle"] || "Track Your Order"}</h1>
              <p className="text-gray-600 mt-1">{content["orders.orderNumber"] || "Order"} #{order.id.slice(0, 8)}</p>
            </div>
            <Badge
              variant={
                statusColors[order.status as keyof typeof statusColors]
              }
              className="text-sm px-4 py-2"
            >
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Progress Timeline */}
        {order.status !== "cancelled" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{content["orders.progress.title"] || "Order Progress"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-brand-orange transition-all duration-500"
                    style={{
                      width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                    }}
                  ></div>
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const isActive = index <= currentStep;
                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-colors ${
                            isActive
                              ? "bg-brand-orange"
                              : "bg-white border-2 border-gray-200"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-sm font-medium text-center ${
                            isActive ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracking Information */}
        {order.trackingNumber && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{content["orders.tracking.title"] || "Tracking Information"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{content["orders.tracking.carrier"] || "Carrier"}:</span>
                  <span className="font-medium">{order.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{content["orders.tracking.number"] || "Tracking Number"}:</span>
                  <span className="font-mono font-medium">
                    {order.trackingNumber}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{content["orders.items.title"] || "Order Items"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-medium hover:text-brand-orange"
                          >
                            {item.title}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {content["orders.items.size"] || "Size"}: {item.size} • {content["orders.items.quantity"] || "Quantity"}: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity, order.currency)}
                        </p>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{content["orders.items.total"] || "Total"}</span>
                    <span className="font-bold text-lg">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>{content["orders.shipping.title"] || "Shipping Address"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.customerName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && (
                    <p>{order.shippingAddress.line2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postal_code}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>{content["orders.details.title"] || "Order Details"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{content["orders.details.date"] || "Order Date"}:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{content["orders.details.id"] || "Order ID"}:</span>
                  <span className="font-mono">{order.id.slice(0, 12)}...</span>
                </div>
              </CardContent>
            </Card>

            {/* Status Updates */}
            <Card>
              <CardHeader>
                <CardTitle>{content["orders.statusUpdates.title"] || "Status Updates"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium capitalize">{history.status}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                      {history.note && (
                        <p className="text-xs text-gray-600 mt-1">
                          {history.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">{content["orders.help.question"] || "Need help with your order?"}</p>
              <Link
                href="/contact"
                className="text-brand-orange hover:underline font-medium"
              >
                {content["orders.help.contact"] || "Contact Support"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
