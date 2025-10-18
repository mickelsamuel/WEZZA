import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import { logAuthEvent, AuditAction } from "@/lib/audit-log";

/**
 * POST /api/auth/2fa/verify
 * Verify a 2FA code and enable 2FA for the user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Get user's 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true, email: true },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA is not set up. Please set it up first." },
        { status: 400 }
      );
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 2, // Allow 2 time windows (±60 seconds)
    });

    if (!verified) {
      // Log failed verification
      await logAuthEvent(
        AuditAction.TWO_FACTOR_VERIFICATION_FAILED,
        user.email,
        false,
        request.headers
      );

      return NextResponse.json(
        { error: "Invalid code. Please try again." },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    // Log successful 2FA enablement
    await logAuthEvent(
      AuditAction.TWO_FACTOR_ENABLED,
      user.email,
      true,
      request.headers
    );

    return NextResponse.json({
      success: true,
      message: "2FA has been successfully enabled!",
    });
  } catch (error) {
    console.error("[2FA Verify] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
