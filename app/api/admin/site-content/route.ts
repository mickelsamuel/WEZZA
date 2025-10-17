import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all site content (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const content = await prisma.siteContent.findMany({
      orderBy: [
        { section: "asc" },
        { key: "asc" }
      ]
    });

    // Group by section for easier UI rendering
    const grouped = content.reduce((acc: any, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {});

    return NextResponse.json({ content, grouped });
  } catch (error) {
    console.error("Error fetching site content:", error);
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    );
  }
}

// POST/PUT update site content (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { updates } = body; // Array of {key, value}

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid request format. Expected { updates: Array }" },
        { status: 400 }
      );
    }

    // Update all content items
    const results = await Promise.all(
      updates.map((item: { key: string; value: string }) =>
        prisma.siteContent.update({
          where: { key: item.key },
          data: { value: item.value }
        })
      )
    );

    return NextResponse.json({
      success: true,
      updated: results.length,
      message: `Successfully updated ${results.length} content item(s)`
    });
  } catch (error) {
    console.error("Error updating site content:", error);
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 }
    );
  }
}
