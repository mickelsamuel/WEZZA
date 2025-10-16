import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { trackCartAbandonment } from "@/lib/email-automation";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { cartItems, cartTotal, email } = await req.json();

    if (!email || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Email and cart items required" },
        { status: 400 }
      );
    }

    // Track cart abandonment
    const result = await trackCartAbandonment(
      email,
      session?.user?.id || null,
      cartItems,
      cartTotal
    );

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to track abandonment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error tracking cart abandonment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
