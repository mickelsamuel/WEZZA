import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeEmail, checkRateLimit, getSafeErrorMessage, logError } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY: Rate limiting to prevent order enumeration
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`order-view:${ip}`, 10, 60000); // 10 requests per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
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

    // Method 1: Check if user is logged in and owns the order
    if (session?.user?.email && session.user.email.toLowerCase() === order.customerEmail.toLowerCase()) {
      return NextResponse.json(order);
    }

    // Method 2: Verify via email parameter (for guest checkout)
    const emailParam = req.nextUrl.searchParams.get("email");

    if (emailParam) {
      try {
        const sanitizedEmail = sanitizeEmail(emailParam);

        if (sanitizedEmail.toLowerCase() === order.customerEmail.toLowerCase()) {
          return NextResponse.json(order);
        }
      } catch (error) {
        // Invalid email format
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    // SECURITY: Neither authentication method succeeded
    // Return 404 instead of 401 to prevent order ID enumeration
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  } catch (error) {
    logError(error, 'orders/[id]/route');
    return NextResponse.json(
      { error: getSafeErrorMessage(error) },
      { status: 500 }
    );
  }
}
