import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeEmail, getSafeErrorMessage, logError } from "@/lib/security";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY: Rate limiting to prevent order enumeration
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitMax = 10;
    const rateLimitWindow = 60000; // 1 minute
    const rateLimit = await checkRateLimit(`order-view:${ip}`, rateLimitMax, rateLimitWindow);

    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      // Return same error for not found and unauthorized to prevent enumeration
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // SECURITY: Verify order ownership via session OR email verification
    const session = await getServerSession(authOptions);

    // Include rate limit headers
    const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);

    // Method 1: Check if user is logged in and owns the order
    if (session?.user?.email && session.user.email.toLowerCase() === order.customerEmail.toLowerCase()) {
      return NextResponse.json(order, { headers });
    }

    // Method 2: Verify via email parameter (for guest checkout)
    const emailParam = req.nextUrl.searchParams.get("email");

    if (emailParam) {
      try {
        const sanitizedEmail = sanitizeEmail(emailParam);

        if (sanitizedEmail.toLowerCase() === order.customerEmail.toLowerCase()) {
          return NextResponse.json(order, { headers });
        }
      } catch (error) {
        // Invalid email format
        return NextResponse.json({ error: "Order not found" }, { status: 404, headers });
      }
    }

    // SECURITY: Neither authentication method succeeded
    // Return 404 instead of 401 to prevent order ID enumeration
    return NextResponse.json({ error: "Order not found" }, { status: 404, headers });

  } catch (error) {
    logError(error, 'orders/[id]/route');
    return NextResponse.json(
      { error: getSafeErrorMessage(error) },
      { status: 500 }
    );
  }
}
