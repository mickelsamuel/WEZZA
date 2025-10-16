import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id] - Get product by ID (admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        collection: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Update product (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      collectionId,
      inStock,
      featured,
      images,
      fabric,
      care,
      shipping,
      sizes,
      colors,
      tags,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price,
        currency,
        collectionId,
        inStock,
        featured,
        images,
        fabric,
        care,
        shipping,
        sizes,
        colors,
        tags,
      },
      include: {
        collection: true,
      },
    });

    // Update inventory if sizes changed
    if (sizes) {
      const inventory = await prisma.productInventory.findUnique({
        where: { productSlug: product.slug },
      });

      if (inventory) {
        const currentSizeQuantities = inventory.sizeQuantities as Record<string, number>;
        const newSizeQuantities: Record<string, number> = {};

        // Keep existing quantities for unchanged sizes, add 10 for new sizes
        sizes.forEach((size: string) => {
          newSizeQuantities[size] = currentSizeQuantities[size] || 10;
        });

        await prisma.productInventory.update({
          where: { productSlug: product.slug },
          data: { sizeQuantities: newSizeQuantities },
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Delete product (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete inventory first
    await prisma.productInventory.deleteMany({
      where: { productSlug: existingProduct.slug },
    });

    // Delete product
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
