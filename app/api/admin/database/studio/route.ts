import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// POST /api/admin/database/studio - Launch Prisma Studio (admin only)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For local development, Prisma Studio runs on port 5555 by default
    const studioUrl = process.env.NODE_ENV === "production"
      ? "https://cloud.prisma.io" // Redirect to Prisma Data Platform for production
      : "http://localhost:5555";

    // In development, we can start Prisma Studio programmatically
    // Note: This only works in local dev, not on Vercel
    if (process.env.NODE_ENV !== "production") {
      // Check if Studio is already running
      try {
        const response = await fetch(studioUrl, { method: "HEAD" });
        if (response.ok) {
          // Studio is already running
          return NextResponse.json({
            url: studioUrl,
            message: "Prisma Studio is already running"
          });
        }
      } catch {
        // Studio is not running, need to start it manually
        return NextResponse.json({
          error: "Prisma Studio is not running. Please start it manually with: npx prisma studio",
          url: null,
          instructions: "Run 'npx prisma studio' in your terminal, then click the button again."
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      url: studioUrl,
      message: process.env.NODE_ENV === "production"
        ? "Redirecting to Prisma Data Platform"
        : "Prisma Studio is running"
    });
  } catch (error) {
    console.error("Error launching Prisma Studio:", error);
    return NextResponse.json(
      { error: "Failed to launch Prisma Studio" },
      { status: 500 }
    );
  }
}
