import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/inventory/[slug] - Get inventory for specific product (admin only)
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.productInventory.findUnique({
      where: { productSlug: params.slug },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        sizes: true,
      },
    });

    return NextResponse.json({
      ...inventory,
      product,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// PUT /api/admin/inventory/[slug] - Update inventory (admin only)
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sizeQuantities, lowStockThreshold } = body;

    // Validate sizeQuantities
    if (sizeQuantities) {
      const isValid = Object.values(sizeQuantities).every(
        (qty) => typeof qty === "number" && qty >= 0
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "All size quantities must be non-negative numbers" },
          { status: 400 }
        );
      }
    }

    // Check if inventory exists
    const existingInventory = await prisma.productInventory.findUnique({
      where: { productSlug: params.slug },
    });

    if (!existingInventory) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Update inventory
    const inventory = await prisma.productInventory.update({
      where: { productSlug: params.slug },
      data: {
        sizeQuantities: sizeQuantities || existingInventory.sizeQuantities,
        lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : existingInventory.lowStockThreshold,
      },
    });

    // Update product inStock status based on inventory
    const sizeQtys = inventory.sizeQuantities as Record<string, number>;
    const totalStock = Object.values(sizeQtys).reduce((sum, qty) => sum + qty, 0);
    const inStock = totalStock > 0;

    await prisma.product.update({
      where: { slug: params.slug },
      data: { inStock },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

// POST /api/admin/inventory/[slug]/adjust - Adjust inventory (add/subtract) (admin only)
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { size, adjustment, reason } = body;

    if (!size || adjustment === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (size, adjustment)" },
        { status: 400 }
      );
    }

    // Check if inventory exists
    const existingInventory = await prisma.productInventory.findUnique({
      where: { productSlug: params.slug },
    });

    if (!existingInventory) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Adjust size quantity
    const sizeQuantities = existingInventory.sizeQuantities as Record<string, number>;
    const currentQty = sizeQuantities[size] || 0;
    const newQty = Math.max(0, currentQty + adjustment); // Ensure non-negative

    sizeQuantities[size] = newQty;

    // Update inventory
    const inventory = await prisma.productInventory.update({
      where: { productSlug: params.slug },
      data: {
        sizeQuantities,
      },
    });

    // Update product inStock status
    const totalStock = Object.values(sizeQuantities).reduce((sum: number, qty) => sum + qty, 0);
    const inStock = totalStock > 0;

    await prisma.product.update({
      where: { slug: params.slug },
      data: { inStock },
    });

    // Log the adjustment (optional - could create AuditLog model for this)
    console.log(`Inventory adjusted for ${params.slug}:`, {
      size,
      adjustment,
      currentQty,
      newQty,
      reason,
      userId: session.user.id,
    });

    return NextResponse.json({
      inventory,
      adjustment: {
        size,
        previousQty: currentQty,
        newQty,
        change: adjustment,
      },
    });
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    return NextResponse.json({ error: "Failed to adjust inventory" }, { status: 500 });
  }
}
