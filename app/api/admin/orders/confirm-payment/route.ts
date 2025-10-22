import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { generatePaymentConfirmationEmail } from "@/lib/email-templates";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore - role exists on session.user
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if already confirmed
    if (order.paymentStatus === "confirmed") {
      return NextResponse.json({ error: "Payment already confirmed" }, { status: 400 });
    }

    // Update order
    const now = new Date();
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "confirmed",
        status: "processing",
        paymentConfirmedAt: now,
        // @ts-ignore - user.id exists
        paymentConfirmedBy: session.user.id,
        statusHistory: [
          ...(order.statusHistory as any[]),
          {
            status: "processing",
            timestamp: now.toISOString(),
            note: "Payment confirmed by admin",
          },
        ],
      },
    });

    // Send confirmation email to customer
    try {
      const items = updatedOrder.items as any[];
      const shippingAddress = updatedOrder.shippingAddress as any;

      const emailHtml = generatePaymentConfirmationEmail({
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        total: updatedOrder.total,
        items: items,
        shippingAddress: shippingAddress,
        paymentConfirmedAt: now,
      });

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "WEZZA <orders@wezza.com>",
        to: updatedOrder.customerEmail,
        subject: `Payment Confirmed - Order ${updatedOrder.orderNumber}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError);
      // Don't fail the payment confirmation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
