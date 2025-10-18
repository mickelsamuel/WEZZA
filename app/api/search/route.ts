import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getSearchSuggestions } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Rate limiting to prevent search abuse/scraping
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitMax = 30;
    const rateLimitWindow = 60000; // 30 searches per minute
    const rateLimit = await checkRateLimit(`search:${ip}`, rateLimitMax, rateLimitWindow);

    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);
      return NextResponse.json(
        { error: "Too many search requests. Please slow down." },
        { status: 429, headers }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // "search" or "suggestions"

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Get suggestions
    if (type === "suggestions") {
      const suggestions = await getSearchSuggestions(query);
      const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);
      return NextResponse.json({ suggestions }, { headers });
    }

    // Perform search
    const results = await searchProducts(query);

    // Log search to database for analytics
    try {
      const session = await getServerSession(authOptions);
      await prisma.searchHistory.create({
        data: {
          userId: session?.user?.id || null,
          query: query.trim(),
          results: results.length,
        },
      });
    } catch (error) {
      // Don't fail the request if logging fails
      console.error("Failed to log search:", error);
    }

    // Include rate limit headers in successful response
    const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);

    return NextResponse.json({
      query,
      results: results.map((r) => ({
        product: r.product,
        matchScore: r.matchScore,
        matchedIn: r.matchedIn,
      })),
      count: results.length,
    }, { headers });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

// Log when user clicks a search result
export async function POST(request: NextRequest) {
  try {
    const { query, productSlug } = await request.json();

    if (!query || !productSlug) {
      return NextResponse.json(
        { error: "Query and productSlug are required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Find the most recent search and update it with the clicked product
    await prisma.searchHistory.updateMany({
      where: {
        userId: session?.user?.id || undefined,
        query: query.trim(),
        clicked: null,
      },
      data: {
        clicked: productSlug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log search click:", error);
    return NextResponse.json(
      { error: "Failed to log click" },
      { status: 500 }
    );
  }
}
