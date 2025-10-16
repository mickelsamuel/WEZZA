import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products - Get all products or filter by slug (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // If slug is provided, return single product
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json({ products: [product] });
    }

    // Otherwise return all products
    const products = await prisma.product.findMany({
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
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

    // Validate required fields
    if (!slug || !title || !description || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 409 });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        slug,
        title,
        description,
        price,
        currency: currency || "CAD",
        collectionId: collectionId || null,
        inStock: inStock !== undefined ? inStock : true,
        featured: featured || false,
        images: images || [],
        fabric: fabric || "",
        care: care || "",
        shipping: shipping || "",
        sizes: sizes || [],
        colors: colors || [],
        tags: tags || [],
      },
      include: {
        collection: true,
      },
    });

    // Create default inventory
    if (sizes && sizes.length > 0) {
      const sizeQuantities: Record<string, number> = {};
      sizes.forEach((size: string) => {
        sizeQuantities[size] = 10; // Default 10 items per size
      });

      await prisma.productInventory.create({
        data: {
          productSlug: slug,
          sizeQuantities,
          lowStockThreshold: 5,
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
