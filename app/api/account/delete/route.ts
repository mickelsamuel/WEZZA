import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuthEvent, AuditAction } from "@/lib/audit-log";

/**
 * DELETE /api/account/delete
 * Delete user account and all associated data
 *
 * Security: Requires authentication
 *
 * This endpoint performs a cascading delete of:
 * - User account
 * - Orders (via cascade)
 * - Addresses (via cascade)
 * - Cart (via cascade)
 * - Reviews (via cascade)
 * - Wishlist (via cascade)
 * - Saved payment methods (via cascade)
 * - Audit logs (via cascade)
 * - All other user-related data
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const headers = request.headers;

    // Get user email for logging
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin/collaborator from deleting their own account
    // They should contact another admin
    if (user.role === "admin" || user.role === "collaborator") {
      return NextResponse.json(
        {
          error: "Admin and collaborator accounts cannot be self-deleted",
          message: "Please contact another administrator to delete your account"
        },
        { status: 403 }
      );
    }

    // Log the account deletion attempt
    await logAuthEvent(
      AuditAction.ACCOUNT_DELETED,
      user.email,
      true,
      headers,
      { userId: session.user.id, reason: "User requested account deletion" }
    );

    // Delete user account (cascade will handle related data)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Account successfully deleted",
    });
  } catch (error) {
    console.error("Failed to delete account:", error);

    return NextResponse.json(
      {
        error: "Failed to delete account",
        message: "An error occurred while deleting your account. Please try again or contact support."
      },
      { status: 500 }
    );
  }
}
