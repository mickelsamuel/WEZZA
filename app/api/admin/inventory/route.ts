import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/admin/inventory - Get all inventory (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.productInventory.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get product details for each inventory item
    const inventoryWithProducts = await Promise.all(
      inventory.map(async (inv: any) => {
        const product = await prisma.product.findUnique({
          where: { slug: inv.productSlug },
          select: {
            id: true,
            slug: true,
            title: true,
            images: true,
            collection: {
              select: {
                name: true,
              },
            },
          },
        });

        // Calculate total stock and low stock status
        const sizeQuantities = inv.sizeQuantities as Record<string, number>;
        const totalStock = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);
        const hasLowStock = Object.values(sizeQuantities).some((qty) => qty <= inv.lowStockThreshold);

        return {
          ...inv,
          product,
          totalStock,
          hasLowStock,
        };
      })
    );

    return NextResponse.json(inventoryWithProducts);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
