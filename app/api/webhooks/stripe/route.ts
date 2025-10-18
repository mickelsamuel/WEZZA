import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/email";
import {
  generateOrderConfirmationEmail,
  OrderConfirmationData,
} from "@/lib/email-templates";
import Stripe from "stripe";

export const runtime = "nodejs";

// In App Router, we don't need to disable body parsing like in Pages Router
// The raw body is accessible via request.body

async function getRawBody(request: NextRequest): Promise<string> {
  const chunks: Uint8Array[] = [];
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error("No body to read");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8");
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const rawBody = await getRawBody(request);
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object.id);
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("Processing checkout.session.completed:", session.id);

    // SECURITY: Idempotency check - prevent duplicate order creation
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existingOrder) {
      console.log("Order already exists for session:", session.id);
      return; // Webhook already processed
    }

    // Retrieve full session details with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    const lineItems = fullSession.line_items?.data || [];

    // Create order in database
    const order = await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        userId: session.metadata?.userId || null,
        customerEmail: session.customer_details?.email || "",
        customerName: session.customer_details?.name || "",
        status: "processing",
        total: session.amount_total || 0,
        currency: session.currency?.toUpperCase() || "CAD",
        items: lineItems.map((item) => ({
          title: (item.price?.product as Stripe.Product)?.name || "Unknown",
          quantity: item.quantity || 1,
          price: item.price?.unit_amount || 0,
        })),
        shippingAddress: {
          street: session.customer_details?.address?.line1 || "",
          city: session.customer_details?.address?.city || "",
          province: session.customer_details?.address?.state || "",
          postalCode: session.customer_details?.address?.postal_code || "",
          country: session.customer_details?.address?.country || "",
        },
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date().toISOString(),
            note: "Order received",
          },
          {
            status: "processing",
            timestamp: new Date().toISOString(),
            note: "Payment confirmed",
          },
        ],
      },
    });

    console.log("Order created:", order.id);

    // Send order confirmation email
    if (session.customer_details?.email) {
      const emailData: OrderConfirmationData = {
        orderNumber: order.id.substring(0, 8).toUpperCase(),
        customerName: session.customer_details.name || "Customer",
        items: lineItems.map((item) => ({
          title: (item.price?.product as Stripe.Product)?.name || "Unknown",
          size: (item.price?.product as Stripe.Product)?.metadata?.size || "N/A",
          quantity: item.quantity || 1,
          price: item.price?.unit_amount || 0,
        })),
        subtotal: session.amount_subtotal || 0,
        shipping: (session.total_details?.amount_shipping || 0),
        total: session.amount_total || 0,
        shippingAddress: {
          street: session.customer_details.address?.line1 || "",
          city: session.customer_details.address?.city || "",
          province: session.customer_details.address?.state || "",
          postalCode: session.customer_details.address?.postal_code || "",
          country: session.customer_details.address?.country || "",
        },
      };

      await resend.emails.send({
        from: FROM_EMAIL,
        to: session.customer_details.email,
        subject: `Order Confirmed - #${emailData.orderNumber}`,
        html: generateOrderConfirmationEmail(emailData),
      });

      console.log("Order confirmation email sent to:", session.customer_details.email);
    }

    // Update user's order relation if authenticated
    if (session.metadata?.userId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: session.metadata.userId },
      });
    }
  } catch (error) {
    console.error("Error handling checkout completion:", error);
    throw error;
  }
}
