import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/email";
import {
  generateShippingConfirmationEmail,
  generateDeliveryNotificationEmail,
  ShippingConfirmationData,
} from "@/lib/email-templates";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, trackingNumber, carrier, note } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Add status to history
    const statusHistory = order.statusHistory as Array<{
      status: string;
      timestamp: string;
      note?: string;
    }>;

    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || undefined,
    });

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        trackingNumber: trackingNumber || null,
        carrier: carrier || null,
        statusHistory,
      },
    });

    // Send email notification to customer about status update
    try {
      if (status === "shipped" && trackingNumber && carrier) {
        // Send shipping confirmation
        const emailData: ShippingConfirmationData = {
          orderNumber: updatedOrder.id.substring(0, 8).toUpperCase(),
          customerName: updatedOrder.customerName,
          trackingNumber,
          carrier,
        };

        await resend.emails.send({
          from: FROM_EMAIL,
          to: updatedOrder.customerEmail,
          subject: `Your Order Has Shipped! - #${emailData.orderNumber}`,
          html: generateShippingConfirmationEmail(emailData),
        });
      } else if (status === "delivered") {
        // Send delivery confirmation
        await resend.emails.send({
          from: FROM_EMAIL,
          to: updatedOrder.customerEmail,
          subject: `Order Delivered! - #${updatedOrder.id.substring(0, 8).toUpperCase()}`,
          html: generateDeliveryNotificationEmail(
            updatedOrder.customerName,
            updatedOrder.id.substring(0, 8).toUpperCase()
          ),
        });
      }
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete the order
    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
