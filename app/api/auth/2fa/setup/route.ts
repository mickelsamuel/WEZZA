import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { logAuthEvent, AuditAction } from "@/lib/audit-log";

/**
 * POST /api/auth/2fa/setup
 * Generate a new 2FA secret and QR code for the user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled. Disable it first to set up again." },
        { status: 400 }
      );
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `WEZZA (${user.email})`,
      issuer: "WEZZA",
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store the secret temporarily (not yet enabled)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false, // Not enabled until verified
      },
    });

    // Log the setup initiation
    await logAuthEvent(
      AuditAction.TWO_FACTOR_SETUP_INITIATED,
      user.email,
      true,
      request.headers
    );

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)",
    });
  } catch (error) {
    console.error("[2FA Setup] Error:", error);
    return NextResponse.json(
      { error: "Failed to set up 2FA" },
      { status: 500 }
    );
  }
}
