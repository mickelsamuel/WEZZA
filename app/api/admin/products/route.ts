import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, getSafeErrorMessage, logError } from "@/lib/security";

// GET /api/admin/products - Get all products or filter by slug (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // SECURITY: Check admin role (case-insensitive)
    if (!session || !isAdmin(session.user.role)) {
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

    // SECURITY: Check admin role (case-insensitive)
    if (!session || !isAdmin(session.user.role)) {
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

    // SECURITY: Comprehensive input validation
    // Validate required fields
    if (!slug || !title || !description || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate slug format and length
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    if (slug.length > 100) {
      return NextResponse.json(
        { error: "Slug must be less than 100 characters" },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length > 255) {
      return NextResponse.json(
        { error: "Title must be less than 255 characters" },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length > 10000) {
      return NextResponse.json(
        { error: "Description must be less than 10,000 characters" },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0 || price > 99999999) {
      return NextResponse.json(
        { error: "Price must be a positive number less than 999,999.99" },
        { status: 400 }
      );
    }

    // Validate images array
    if (images && (!Array.isArray(images) || images.length === 0)) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Validate that all images are valid URLs
    if (images && Array.isArray(images)) {
      for (const imageUrl of images) {
        try {
          new URL(imageUrl);
        } catch {
          return NextResponse.json(
            { error: `Invalid image URL: ${imageUrl}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate arrays if provided
    if (sizes && !Array.isArray(sizes)) {
      return NextResponse.json({ error: "Sizes must be an array" }, { status: 400 });
    }

    if (colors && !Array.isArray(colors)) {
      return NextResponse.json({ error: "Colors must be an array" }, { status: 400 });
    }

    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ error: "Tags must be an array" }, { status: 400 });
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
