import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { OrdersTable } from "./orders-table";

async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      createdAt: true,
      total: true,
      currency: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      expiresAt: true,
    },
  });

  // Convert to plain objects with serialized dates
  return orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    expiresAt: order.expiresAt ? order.expiresAt.toISOString() : null,
  }));
}

export default async function OrdersPage() {
  const orders = await getOrders();

  // Count pending payments
  const pendingPayments = orders.filter(
    (order) =>
      order.paymentStatus === "pending" &&
      order.status === "pending_payment" &&
      (!order.expiresAt || new Date(order.expiresAt) > new Date())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all orders</p>
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900">
                {pendingPayments.length} Order{pendingPayments.length !== 1 ? "s" : ""} Awaiting
                Payment Confirmation
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                Review pending e-transfers and confirm payments to process orders.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {orders.length} total order{orders.length !== 1 ? "s" : ""} • {pendingPayments.length}{" "}
            pending payment{pendingPayments.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          ) : (
            <OrdersTable initialOrders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
