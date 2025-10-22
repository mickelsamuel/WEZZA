import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CheckoutItem {
  slug: string;
  size: string;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

// Generate a unique order number
async function generateOrderNumber(): Promise<string> {
  // Get the count of all orders to generate a sequential number
  const orderCount = await prisma.order.count();
  const orderNum = (orderCount + 1).toString().padStart(4, "0");
  return `WEZZA-${orderNum}`;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting to prevent checkout abuse
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitMax = 5;
    const rateLimitWindow = 300000; // 5 checkouts per 5 minutes
    const rateLimit = await checkRateLimit(`checkout:${ip}`, rateLimitMax, rateLimitWindow);

    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(rateLimitMax, rateLimit.remaining, rateLimit.resetAt!);
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { status: 429, headers }
      );
    }

    const { items, shippingAddress }: { items: CheckoutItem[]; shippingAddress: ShippingAddress } =
      await request.json();

    // Validate input
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.email || !shippingAddress.name) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
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

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.slug === item.slug);

      if (!product) {
        throw new Error(`Product not found: ${item.slug}`);
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      return {
        slug: product.slug,
        title: product.title,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
        image: (product.images as string[])[0] || "",
        collection: product.collection?.name || "Core",
      };
    });

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate expiration date (48 hours from now by default)
    const expirationHours = 48;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "pending_payment",
        paymentMethod: "etransfer",
        paymentStatus: "pending",
        total,
        currency: "CAD",
        items: orderItems as any,
        shippingAddress: shippingAddress as any,
        customerEmail: shippingAddress.email,
        customerName: shippingAddress.name,
        customerPhone: shippingAddress.phone || null,
        expiresAt,
        statusHistory: [
          {
            status: "pending_payment",
            timestamp: new Date().toISOString(),
            note: "Order created, awaiting e-transfer payment",
          },
        ],
      },
    });

    // Send email with e-transfer instructions
    try {
      await sendPaymentInstructionsEmail({
        orderNumber,
        customerEmail: shippingAddress.email,
        customerName: shippingAddress.name,
        total,
        items: orderItems,
        expiresAt,
      });
    } catch (emailError) {
      console.error("Failed to send payment instructions email:", emailError);
      // Don't fail the checkout if email fails - order is still created
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendPaymentInstructionsEmail({
  orderNumber,
  customerEmail,
  customerName,
  total,
  items,
  expiresAt,
}: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  items: any[];
  expiresAt: Date;
}) {
  const etransferEmail = process.env.ETRANSFER_EMAIL || "payments@wezza.com";
  const securityQuestion = process.env.ETRANSFER_SECURITY_QUESTION;
  const securityAnswer = process.env.ETRANSFER_SECURITY_ANSWER;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const formattedTotal = (total / 100).toFixed(2);
  const formattedExpiry = expiresAt.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format order items for email
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.title} (${item.size})
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.price / 100).toFixed(2)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${((item.price * item.quantity) / 100).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Instructions - Order ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #000; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">WEZZA</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Order Confirmation</p>
  </div>

  <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #000; margin-top: 0;">Thank You for Your Order!</h2>
    <p>Hi ${customerName},</p>
    <p>Your order has been received! To complete your purchase, please send an e-transfer with the details below.</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #FF6B35;">
      <h3 style="margin-top: 0; color: #FF6B35;">📧 E-Transfer Instructions</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #FF6B35;">$${formattedTotal} CAD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Send To:</td>
          <td style="padding: 8px 0; text-align: right;">${etransferEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
          <td style="padding: 8px 0; text-align: right;">${orderNumber}</td>
        </tr>
        ${
          securityQuestion
            ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Security Question:</td>
          <td style="padding: 8px 0; text-align: right;">${securityQuestion}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Security Answer:</td>
          <td style="padding: 8px 0; text-align: right;">${securityAnswer}</td>
        </tr>
        `
            : ""
        }
      </table>
      <div style="background-color: #FFF8E7; padding: 12px; border-radius: 4px; margin-top: 15px;">
        <p style="margin: 0; font-size: 14px;"><strong>⚠️ Important:</strong> Please include your order number <strong>${orderNumber}</strong> in the e-transfer message so we can identify your payment.</p>
      </div>
    </div>

    <h3>Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; background-color: #fff; margin: 15px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
          <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
          <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold;">Subtotal:</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold;">$${formattedTotal}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold;">Shipping:</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold;">FREE</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px; color: #FF6B35;">$${formattedTotal} CAD</td>
        </tr>
      </tbody>
    </table>

    <div style="background-color: #FFF0F0; padding: 15px; border-radius: 4px; border-left: 4px solid #FF6B35; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>⏰ Payment Deadline:</strong> ${formattedExpiry}</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;">Your order will be automatically cancelled if payment is not received by this time.</p>
    </div>

    <h3>What Happens Next?</h3>
    <ol style="padding-left: 20px;">
      <li style="margin: 8px 0;">Send the e-transfer to <strong>${etransferEmail}</strong></li>
      <li style="margin: 8px 0;">Our team will confirm your payment within 24 hours</li>
      <li style="margin: 8px 0;">You'll receive a confirmation email with your receipt</li>
      <li style="margin: 8px 0;">Your order will be processed and shipped</li>
      <li style="margin: 8px 0;">You'll receive tracking information once shipped</li>
    </ol>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${siteUrl}/orders/${orderNumber}" style="display: inline-block; background-color: #FF6B35; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Order Status</a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="font-size: 13px; color: #666;">
      Questions? Contact us at ${process.env.RESEND_FROM_EMAIL || "support@wezza.com"}
    </p>
    <p style="font-size: 13px; color: #666;">
      Order Number: ${orderNumber}
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} WEZZA. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "WEZZA <orders@wezza.com>",
    to: customerEmail,
    subject: `Payment Instructions - Order ${orderNumber}`,
    html: htmlContent,
  });
}
