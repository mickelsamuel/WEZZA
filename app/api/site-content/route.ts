import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET site content (public endpoint for frontend)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const key = searchParams.get("key");

    let content;

    if (key) {
      // Get single content item by key
      content = await prisma.siteContent.findUnique({
        where: { key }
      });
      return NextResponse.json({ content });
    } else if (section) {
      // Get all content for a section
      content = await prisma.siteContent.findMany({
        where: { section },
        orderBy: { key: "asc" }
      });
      return NextResponse.json({ content });
    } else {
      // Get all content
      content = await prisma.siteContent.findMany({
        orderBy: [
          { section: "asc" },
          { key: "asc" }
        ]
      });
      return NextResponse.json({ content });
    }
  } catch (error) {
    console.error("Error fetching site content:", error);
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    );
  }
}
