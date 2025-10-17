import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");
    const productSlug = searchParams.get("slug");

    if (!productId && !productSlug) {
      return NextResponse.json(
        { error: "Product ID or slug is required" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: productId ? { id: productId } : { slug: productSlug! },
      include: {
        collaborators: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check permissions: must be admin or collaborator on this product
    const isAdmin = currentUser.role?.toLowerCase() === "admin";
    const isCollaborator = product.collaborators.some(
      (collab) => collab.userId === currentUser.id
    );

    if (!isAdmin && !isCollaborator) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to view these stats" },
        { status: 403 }
      );
    }

    // Calculate statistics
    // Get all orders containing this product
    const orders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ["cancelled"], // Exclude cancelled orders
        },
      },
    });

    // Filter orders that contain this product
    const productOrders = orders.filter((order) => {
      const items = order.items as any[];
      return items.some((item) => item.slug === product.slug);
    });

    // Calculate totals
    let totalRevenue = 0;
    let totalUnits = 0;

    productOrders.forEach((order) => {
      const items = order.items as any[];
      const productItems = items.filter((item) => item.slug === product.slug);
      productItems.forEach((item) => {
        totalRevenue += item.price * item.quantity;
        totalUnits += item.quantity;
      });
    });

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { productSlug: product.slug },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    const stats = {
      totalRevenue,
      totalOrders: productOrders.length,
      totalUnits,
      averageRating,
      reviewCount: reviews.length,
      viewCount: 0, // Placeholder - could add view tracking later
      inStockStatus: product.inStock,
      currency: product.currency,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
