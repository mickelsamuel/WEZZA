"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderComments } from "@/components/order-comments";
import { CheckCircle, Clock, Package, Truck, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface OrderItem {
  slug: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  collection: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    email: string;
    phone?: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  expiresAt: string;
  createdAt: string;
  paymentConfirmedAt?: string;
  trackingNumber?: string;
  carrier?: string;
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "completed":
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
      case "expired":
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Order Not Found</h1>
        <p className="mt-2 text-muted-foreground">{error || "The order you're looking for doesn't exist."}</p>
      </div>
    );
  }

  const formattedTotal = (order.total / 100).toFixed(2);
  const expiryDate = new Date(order.expiresAt);
  const isExpired = expiryDate < new Date();

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Order Details</h1>
        <p className="mt-2 text-muted-foreground">Order #{order.orderNumber}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Order Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <h2 className="font-heading text-lg font-bold">Order Status</h2>
                  <Badge className={getStatusColor(order.status)}>
                    {formatStatus(order.status)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {formatStatus(order.paymentStatus)}
                </Badge>
              </div>
            </div>

            {order.paymentStatus === "pending" && !isExpired && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div className="w-full">
                    <h3 className="font-bold text-yellow-900">📧 E-Transfer Payment Instructions</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-800 font-semibold">Amount:</span>
                        <span className="text-lg font-bold text-yellow-900">${formattedTotal} CAD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-800 font-semibold">Send to:</span>
                        <span className="text-sm font-bold text-yellow-900">wezza28711@gmail.com</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-800 font-semibold">Order Number:</span>
                        <span className="text-sm font-bold text-yellow-900">{order.orderNumber}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                      <p className="text-xs text-yellow-900">
                        <strong>⚠️ Important:</strong> Include your order number <strong>{order.orderNumber}</strong> in the e-transfer message so we can identify your payment.
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-yellow-800">
                      <strong>Payment expires:</strong> {expiryDate.toLocaleDateString()} at {expiryDate.toLocaleTimeString()}
                    </p>
                    <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                      <p className="text-xs text-orange-900">
                        <strong>📧 Check Your Spam Folder:</strong> Our confirmation emails sometimes end up in spam. Please check your spam/junk folder and mark us as "Not Spam" to ensure you receive all order updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isExpired && order.paymentStatus === "pending" && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex gap-2">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900">Order Expired</h3>
                    <p className="mt-1 text-sm text-red-800">
                      This order expired on {expiryDate.toLocaleString()}. Please place a new order.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.trackingNumber && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4 border border-blue-200">
                <div className="flex gap-2">
                  <Truck className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-blue-900">Tracking Information</h3>
                    <p className="mt-1 text-sm text-blue-800">
                      Carrier: <strong>{order.carrier}</strong>
                    </p>
                    <p className="text-sm text-blue-800">
                      Tracking: <strong>{order.trackingNumber}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      ${(item.price / 100).toFixed(2)} × {item.quantity} = $
                      {((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${formattedTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>FREE</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${formattedTotal} CAD</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Shipping Address Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Shipping Address</h2>
            <div className="space-y-1 text-sm">
              <p className="font-bold">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.province}
              </p>
              <p>{order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <Separator className="my-3" />
              <p className="text-muted-foreground">Email</p>
              <p>{order.shippingAddress.email}</p>
              {order.shippingAddress.phone && (
                <>
                  <p className="text-muted-foreground mt-2">Phone</p>
                  <p>{order.shippingAddress.phone}</p>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 mt-6">
            <h2 className="font-heading text-lg font-bold mb-4">Order Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.paymentConfirmedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Confirmed</span>
                  <span>{new Date(order.paymentConfirmedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>E-Transfer</span>
              </div>
            </div>
          </Card>

          <OrderComments orderNumber={order.orderNumber} />
        </div>
      </div>
    </div>
  );
}
