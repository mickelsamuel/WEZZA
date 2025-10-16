import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface CheckoutItem {
  slug: string;
  size: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CheckoutItem[] } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Get all products from database
    const productSlugs = items.map((item) => item.slug);
    const products = await prisma.product.findMany({
      where: {
        slug: {
          in: productSlugs,
        },
      },
      include: {
        collection: {
          select: { name: true },
        },
      },
    });

    const lineItems = items.map((item) => {
      const product = products.find((p) => p.slug === item.slug);

      if (!product) {
        throw new Error(`Product not found: ${item.slug}`);
      }

      const images = (product.images as string[]) || [];

      return {
        price_data: {
          currency: "cad",
          product_data: {
            name: `${product.title} (${item.size})`,
            description: product.description,
            images: images.length > 0 ? [
              `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${images[0]}`,
            ] : [],
            metadata: {
              slug: product.slug,
              size: item.size,
              collection: product.collection?.name || "Core",
            },
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["CA", "US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "cad",
            },
            display_name: "Free Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
