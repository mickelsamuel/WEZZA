import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is called by Vercel Cron to prevent Supabase from pausing
// Runs once per week - minimal, non-spammy database ping

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Simple query to keep the database active
    const result = await prisma.$queryRaw`SELECT 1 as ping`;

    console.log("[Keep-Alive] Database ping successful:", new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: "Database ping successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Keep-Alive] Database ping failed:", error);
    return NextResponse.json({
      success: false,
      error: "Database ping failed"
    }, { status: 500 });
  }
}
