import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, isUrlArray, getSafeErrorMessage, logError } from "@/lib/security";

// GET /api/admin/instagram - Get Instagram gallery images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // SECURITY: Check admin role (case-insensitive)
    if (!session || !isAdmin(session.user.role)) {
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

    // SECURITY: Parse and validate the images from JSON string
    let images: string[] = [];
    try {
      const parsed = JSON.parse(gallery.url as string);
      // Validate it's an array of valid URLs
      if (isUrlArray(parsed)) {
        images = parsed;
      } else {
        console.warn("Instagram gallery contains invalid URLs");
        images = [];
      }
    } catch (error) {
      logError(error, 'admin/instagram GET - JSON parse');
      images = [];
    }

    return NextResponse.json({ images });
  } catch (error) {
    logError(error, 'admin/instagram GET');
    return NextResponse.json({ error: getSafeErrorMessage(error) }, { status: 500 });
  }
}

// POST /api/admin/instagram - Update Instagram gallery images
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // SECURITY: Check admin role (case-insensitive)
    if (!session || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { images } = body;

    // SECURITY: Validate images is an array of valid URLs
    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Images must be an array" }, { status: 400 });
    }

    if (!isUrlArray(images)) {
      return NextResponse.json({ error: "All images must be valid URLs" }, { status: 400 });
    }

    // Limit number of images to prevent abuse
    if (images.length > 50) {
      return NextResponse.json({ error: "Maximum 50 images allowed" }, { status: 400 });
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
    logError(error, 'admin/instagram POST');
    return NextResponse.json({ error: getSafeErrorMessage(error) }, { status: 500 });
  }
}
