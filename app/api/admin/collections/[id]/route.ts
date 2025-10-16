import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/collections/[id] - Get collection by ID (admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            slug: true,
            title: true,
            price: true,
            images: true,
            inStock: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

// PUT /api/admin/collections/[id] - Update collection (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, imageUrl, featured, sortOrder } = body;

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id: params.id },
    });

    if (!existingCollection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Update collection (slug cannot be changed)
    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        name,
        description,
        imageUrl,
        featured,
        sortOrder,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

// DELETE /api/admin/collections/[id] - Delete collection (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingCollection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Check if collection has products
    if (existingCollection._count.products > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete collection with products. Please remove all products first or reassign them to another collection.",
        },
        { status: 400 }
      );
    }

    // Delete collection
    await prisma.collection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
