import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET - Get all comments for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        comments: {
          where: {
            // If user is admin, show all comments including admin-only
            // If user is customer, only show non-admin-only comments
            ...(session?.user?.role === "admin"
              ? {}
              : { isAdminOnly: false }),
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has access to this order
    const isAdmin = session?.user?.role === "admin";
    const isOrderOwner = session?.user?.email === order.customerEmail;

    if (!isAdmin && !isOrderOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ comments: order.comments });
  } catch (error) {
    console.error("Error fetching order comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, isAdminOnly } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has access to this order
    const isAdmin = session.user.role === "admin";
    const isOrderOwner = session.user.email === order.customerEmail;

    if (!isAdmin && !isOrderOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create admin-only comments
    const finalIsAdminOnly = isAdmin ? (isAdminOnly || false) : false;

    // Create the comment
    const comment = await prisma.orderComment.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        userName: session.user.name || session.user.email || "User",
        userRole: isAdmin ? "admin" : "customer",
        message: message.trim(),
        isAdminOnly: finalIsAdminOnly,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error creating order comment:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
