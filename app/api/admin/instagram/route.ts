import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/instagram - Get Instagram gallery images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Instagram gallery from database
    const gallery = await prisma.siteImage.findUnique({
      where: { key: "instagram-gallery" },
    });

    if (!gallery) {
      // Return empty array if not set yet
      return NextResponse.json({ images: [] });
    }

    // Parse the images from JSON
    const images = (gallery.url as any) || [];

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching Instagram gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// POST /api/admin/instagram - Update Instagram gallery images
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { images } = body;

    // Validate images array
    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Images must be an array" }, { status: 400 });
    }

    // Upsert the gallery
    await prisma.siteImage.upsert({
      where: { key: "instagram-gallery" },
      update: {
        url: JSON.stringify(images),
        alt: "Instagram Gallery",
        description: "Homepage Instagram gallery images",
      },
      create: {
        key: "instagram-gallery",
        url: JSON.stringify(images),
        alt: "Instagram Gallery",
        description: "Homepage Instagram gallery images",
      },
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Error updating Instagram gallery:", error);
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
  }
}
