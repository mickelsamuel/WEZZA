"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const statusColors = {
  pending: "warning",
  pending_payment: "warning",
  processing: "default",
  shipped: "default",
  delivered: "success",
  completed: "success",
  cancelled: "destructive",
  expired: "destructive",
} as const;

const paymentStatusColors = {
  pending: "warning",
  confirmed: "success",
  failed: "destructive",
  refunded: "default",
} as const;

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  expiresAt: string | null;
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleConfirmPayment = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Confirm that you've received the e-transfer for order ${orderNumber}?`)) {
      return;
    }

    setConfirmingPayment(orderId);

    try {
      const response = await fetch("/api/admin/orders/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm payment");
      }

      toast({
        title: "Payment Confirmed",
        description: `Payment for order ${orderNumber} has been confirmed. Customer will receive a receipt email.`,
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive",
      });
    } finally {
      setConfirmingPayment(null);
    }
  };

  const isOrderExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Order Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const expired = isOrderExpired(order.expiresAt);
          const needsPaymentConfirmation =
            order.paymentStatus === "pending" && order.status === "pending_payment" && !expired;

          return (
            <TableRow
              key={order.id}
              className={needsPaymentConfirmation ? "bg-yellow-50/50" : undefined}
            >
              <TableCell className="font-mono text-sm font-bold">
                {order.orderNumber}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
                <div className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                {formatPrice(order.total, order.currency)}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[order.status as keyof typeof statusColors] || "default"}>
                  {order.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant={
                      paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors] ||
                      "default"
                    }
                    className="w-fit"
                  >
                    {order.paymentStatus}
                  </Badge>
                  {needsPaymentConfirmation && (
                    <div className="flex items-center gap-1 text-xs text-yellow-700">
                      <Clock className="h-3 w-3" />
                      <span>Awaiting confirmation</span>
                    </div>
                  )}
                  {expired && order.paymentStatus === "pending" && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Expired</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-brand-orange hover:underline text-sm"
                  >
                    View Details
                  </Link>
                  {needsPaymentConfirmation && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleConfirmPayment(order.id, order.orderNumber)}
                      disabled={confirmingPayment === order.id}
                      className="w-fit"
                    >
                      {confirmingPayment === order.id ? (
                        "Confirming..."
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm Payment
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
