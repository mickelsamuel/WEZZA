import { NextRequest, NextResponse } from "next/server";
import {
  processCartAbandonments,
  processPostPurchaseEmails,
} from "@/lib/email-automation";

export const dynamic = 'force-dynamic';

/**
 * Cron job endpoint for processing email automation
 * Should be called via Vercel Cron or external cron service
 *
 * Secure this endpoint in production with:
 * - Vercel Cron Secret
 * - API Key authentication
 * - IP whitelisting
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (in production)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type");

    if (type === "cart_abandonment") {
      const result = await processCartAbandonments();
      return NextResponse.json({
        success: true,
        type: "cart_abandonment",
        ...result,
      });
    } else if (type === "post_purchase") {
      const result = await processPostPurchaseEmails();
      return NextResponse.json({
        success: true,
        type: "post_purchase",
        ...result,
      });
    } else if (type === "all" || !type) {
      // Process all automation types
      const [abandonmentResult, postPurchaseResult] = await Promise.all([
        processCartAbandonments(),
        processPostPurchaseEmails(),
      ]);

      return NextResponse.json({
        success: true,
        cart_abandonment: abandonmentResult,
        post_purchase: postPurchaseResult,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid automation type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing email automation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
