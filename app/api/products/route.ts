import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");
    const colors = searchParams.get("colors")?.split(",").filter(Boolean);
    const sizes = searchParams.get("sizes")?.split(",").filter(Boolean);
    const sort = searchParams.get("sort") || "newest";
    const inStock = searchParams.get("inStock") === "true";

    // Build where clause
    const where: any = {};

    if (collection) {
      where.collection = {
        name: collection,
      };
    }

    if (colors && colors.length > 0) {
      where.colors = {
        hasSome: colors,
      };
    }

    if (sizes && sizes.length > 0) {
      where.sizes = {
        hasSome: sizes,
      };
    }

    if (inStock) {
      where.inStock = true;
    }

    // Build orderBy
    let orderBy: any;
    switch (sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        collection: {
          select: { name: true },
        },
      },
      orderBy,
    });

    // Transform to match Product type
    const transformedProducts = products.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      collection: (p.collection?.name || "Core") as "Core" | "Lunar" | "Customizable",
      images: (p.images as string[]) || [],
      inStock: p.inStock,
      featured: p.featured,
      fabric: p.fabric,
      care: p.care,
      shipping: p.shipping,
      sizes: (p.sizes as string[]) || [],
      colors: (p.colors as string[]) || [],
      tags: (p.tags as string[]) || [],
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
