import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

// GET - Fetch reviews for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");

    if (!productSlug) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productSlug,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting to prevent review spam
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitMax = 3;
    const rateLimitWindow = 3600000; // 3 reviews per hour
    const rateLimit = await checkRateLimit(`review:${ip}`, rateLimitMax, rateLimitWindow);

    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);
      return NextResponse.json(
        { error: "Too many review submissions. Please try again later." },
        { status: 429, headers }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productSlug, rating, comment } = await request.json();

    if (!productSlug || !rating) {
      return NextResponse.json(
        { error: "Product slug and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productSlug: {
          userId: session.user.id,
          productSlug,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productSlug,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Include rate limit headers in successful response
    const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);

    return NextResponse.json({ review }, { status: 201, headers });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
