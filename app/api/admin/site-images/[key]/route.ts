import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/site-images/[key] - Get site image by key (admin only)
export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const image = await prisma.siteImage.findUnique({
      where: { key: params.key },
    });

    if (!image) {
      return NextResponse.json({ error: "Site image not found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error fetching site image:", error);
    return NextResponse.json({ error: "Failed to fetch site image" }, { status: 500 });
  }
}

// DELETE /api/admin/site-images/[key] - Delete site image (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if image exists
    const existingImage = await prisma.siteImage.findUnique({
      where: { key: params.key },
    });

    if (!existingImage) {
      return NextResponse.json({ error: "Site image not found" }, { status: 404 });
    }

    // Delete image
    await prisma.siteImage.delete({
      where: { key: params.key },
    });

    return NextResponse.json({ message: "Site image deleted successfully" });
  } catch (error) {
    console.error("Error deleting site image:", error);
    return NextResponse.json({ error: "Failed to delete site image" }, { status: 500 });
  }
}
