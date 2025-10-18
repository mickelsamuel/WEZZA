import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAuthEvent, AuditAction } from "@/lib/audit-log";

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for the user (requires password confirmation)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to disable 2FA" },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Log failed attempt
      await logAuthEvent(
        AuditAction.TWO_FACTOR_DISABLE_FAILED,
        user.email,
        false,
        request.headers,
        { reason: "invalid_password" }
      );

      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Disable 2FA and clear secret
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Log successful 2FA disablement
    await logAuthEvent(
      AuditAction.TWO_FACTOR_DISABLED,
      user.email,
      true,
      request.headers
    );

    return NextResponse.json({
      success: true,
      message: "2FA has been successfully disabled",
    });
  } catch (error) {
    console.error("[2FA Disable] Error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
