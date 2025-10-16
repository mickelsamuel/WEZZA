import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/site-images - Get all site images (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const images = await prisma.siteImage.findMany({
      orderBy: {
        key: "asc",
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching site images:", error);
    return NextResponse.json({ error: "Failed to fetch site images" }, { status: 500 });
  }
}

// POST /api/admin/site-images - Create or update site image (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, url, alt, description } = body;

    // Validate required fields
    if (!key || !url) {
      return NextResponse.json({ error: "Missing required fields (key, url)" }, { status: 400 });
    }

    // Upsert site image
    const image = await prisma.siteImage.upsert({
      where: { key },
      update: {
        url,
        alt,
        description,
      },
      create: {
        key,
        url,
        alt,
        description,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error creating/updating site image:", error);
    return NextResponse.json({ error: "Failed to create/update site image" }, { status: 500 });
  }
}
