import { prisma } from "./prisma";
import { Resend } from "resend";
import { formatPrice } from "./currency";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "wezza28711@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface CartItem {
  slug: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
}

/**
 * Send welcome email series when user registers
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  userId: string
) {
  try {
    const subject = "Welcome to WEZZA - Your Premium Streetwear Journey Starts Here";
    const htmlContent = generateWelcomeEmailHTML(name);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    });

    if (error) {
      throw error;
    }

    // Log email
    await prisma.emailLog.create({
      data: {
        userId,
        email,
        type: "welcome",
        subject,
        status: "sent",
        sentAt: new Date(),
      },
    });

    // Schedule follow-up email (Day 3: Style Tips)
    await scheduleFollowUpEmail(email, userId, "welcome_day3", 3);

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    await prisma.emailLog.create({
      data: {
        userId,
        email,
        type: "welcome",
        subject: "Welcome to WEZZA - Your Premium Streetwear Journey Starts Here",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return { success: false, error };
  }
}

/**
 * Track cart abandonment and send reminder email after 24 hours
 */
export async function trackCartAbandonment(
  email: string,
  userId: string | null,
  cartItems: CartItem[],
  cartTotal: number
) {
  try {
    // Check if abandonment already exists (within last 7 days)
    const existingAbandonment = await prisma.cartAbandonment.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingAbandonment) {
      // Update existing abandonment
      await prisma.cartAbandonment.update({
        where: { id: existingAbandonment.id },
        data: {
          cartItems: cartItems as any,
          cartTotal,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new abandonment record
      await prisma.cartAbandonment.create({
        data: {
          userId,
          email,
          cartItems: cartItems as any,
          cartTotal,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error tracking cart abandonment:", error);
    return { success: false, error };
  }
}

/**
 * Send cart abandonment reminder email
 */
export async function sendCartAbandonmentEmail(abandonmentId: string) {
  try {
    const abandonment = await prisma.cartAbandonment.findUnique({
      where: { id: abandonmentId },
    });

    if (!abandonment || abandonment.reminderSent) {
      return { success: false, reason: "Already sent or not found" };
    }

    const cartItems = abandonment.cartItems as unknown as CartItem[];
    const subject = "You left something behind... 🛒";
    const htmlContent = generateCartAbandonmentEmailHTML(
      cartItems,
      abandonment.cartTotal
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: abandonment.email,
      subject,
      html: htmlContent,
    });

    if (error) {
      throw error;
    }

    // Mark as sent
    await prisma.cartAbandonment.update({
      where: { id: abandonmentId },
      data: { reminderSent: true },
    });

    // Log email
    await prisma.emailLog.create({
      data: {
        userId: abandonment.userId,
        email: abandonment.email,
        type: "cart_abandonment",
        subject,
        status: "sent",
        sentAt: new Date(),
        metadata: { cartTotal: abandonment.cartTotal, itemCount: cartItems.length },
      },
    });

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending cart abandonment email:", error);
    return { success: false, error };
  }
}

/**
 * Send post-purchase follow-up email
 */
export async function sendPostPurchaseEmail(
  orderId: string,
  delayDays: number = 7
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, reason: "Order not found" };
    }

    // Check if already sent
    const existingLog = await prisma.emailLog.findFirst({
      where: {
        email: order.customerEmail,
        type: "post_purchase",
        metadata: {
          path: ["orderId"],
          equals: orderId,
        },
      },
    });

    if (existingLog) {
      return { success: false, reason: "Already sent" };
    }

    const items = order.items as unknown as CartItem[];
    const subject = "How's your WEZZA hoodie? Share your thoughts!";
    const htmlContent = generatePostPurchaseEmailHTML(
      order.customerName,
      items,
      orderId
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      throw error;
    }

    // Log email
    await prisma.emailLog.create({
      data: {
        userId: order.userId,
        email: order.customerEmail,
        type: "post_purchase",
        subject,
        status: "sent",
        sentAt: new Date(),
        metadata: { orderId, itemCount: items.length },
      },
    });

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error sending post-purchase email:", error);
    return { success: false, error };
  }
}

/**
 * Schedule a follow-up email
 */
async function scheduleFollowUpEmail(
  email: string,
  userId: string,
  type: string,
  delayDays: number
) {
  const scheduledFor = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);

  // In production, you would use a job queue (e.g., Bull, BullMQ)
  // For now, we'll just log it
  console.log(
    `Scheduled ${type} email for ${email} at ${scheduledFor.toISOString()}`
  );

  // TODO: Implement with a job queue or cron job
}

/**
 * Process pending cart abandonments (run via cron)
 */
export async function processCartAbandonments() {
  try {
    // Find abandonments older than 24 hours that haven't sent reminders
    const abandonments = await prisma.cartAbandonment.findMany({
      where: {
        reminderSent: false,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      },
      take: 50, // Process in batches
    });

    const results = await Promise.allSettled(
      abandonments.map((abandonment: any) =>
        sendCartAbandonmentEmail(abandonment.id)
      )
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    console.log(
      `Processed ${abandonments.length} cart abandonments, ${successCount} sent successfully`
    );

    return { processed: abandonments.length, sent: successCount };
  } catch (error) {
    console.error("Error processing cart abandonments:", error);
    return { processed: 0, sent: 0, error };
  }
}

/**
 * Process post-purchase emails (run via cron)
 */
export async function processPostPurchaseEmails() {
  try {
    // Find orders delivered 7 days ago that haven't received follow-up
    const orders = await prisma.order.findMany({
      where: {
        status: "delivered",
        updatedAt: {
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          gte: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
      },
      take: 50,
    });

    const results = await Promise.allSettled(
      orders.map((order: any) => sendPostPurchaseEmail(order.id))
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    console.log(
      `Processed ${orders.length} post-purchase emails, ${successCount} sent successfully`
    );

    return { processed: orders.length, sent: successCount };
  } catch (error) {
    console.error("Error processing post-purchase emails:", error);
    return { processed: 0, sent: 0, error };
  }
}

/**
 * Send restock notification email to waitlist subscribers
 */
export async function sendRestockNotification(
  productSlug: string,
  size: string,
  productTitle: string
) {
  try {
    // Get all pending notifications for this product/size
    const notifications = await prisma.stockNotification.findMany({
      where: {
        productSlug,
        size,
        notified: false,
      },
    });

    if (notifications.length === 0) {
      return { success: true, sent: 0, message: "No pending notifications" };
    }

    console.log(
      `Sending restock notifications for ${productTitle} (${size}) to ${notifications.length} subscribers`
    );

    // Send emails in batches
    const results = await Promise.allSettled(
      notifications.map(async (notification: any) => {
        const subject = `${productTitle} in ${size} is Back in Stock! 🎉`;
        const htmlContent = generateRestockEmailHTML(
          productTitle,
          size,
          productSlug
        );

        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: notification.email,
          subject,
          html: htmlContent,
        });

        if (error) {
          throw error;
        }

        // Mark as notified
        await prisma.stockNotification.update({
          where: { id: notification.id },
          data: {
            notified: true,
            notifiedAt: new Date(),
          },
        });

        // Log email
        await prisma.emailLog.create({
          data: {
            userId: notification.userId,
            email: notification.email,
            type: "restock_notification",
            subject,
            status: "sent",
            sentAt: new Date(),
            metadata: { productSlug, size },
          },
        });

        return { success: true, email: notification.email };
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success
    ).length;

    console.log(
      `Restock notifications: ${successCount}/${notifications.length} sent successfully`
    );

    return {
      success: true,
      sent: successCount,
      total: notifications.length,
    };
  } catch (error) {
    console.error("Error sending restock notifications:", error);
    return { success: false, sent: 0, error };
  }
}

/**
 * Trigger restock notifications when inventory is updated
 * Call this function when admin updates product inventory
 */
export async function triggerRestockNotifications(
  productSlug: string,
  sizeQuantities: Record<string, number>
) {
  try {
    const results = [];

    // Check each size that now has stock
    for (const [size, quantity] of Object.entries(sizeQuantities)) {
      if (quantity > 0) {
        // Check if there are pending notifications
        const pendingCount = await prisma.stockNotification.count({
          where: {
            productSlug,
            size,
            notified: false,
          },
        });

        if (pendingCount > 0) {
          // Get product title
          const productsModule = await import("./products");
          const product = productsModule.products.find(
            (p: any) => p.slug === productSlug
          );

          if (product) {
            const result = await sendRestockNotification(
              productSlug,
              size,
              product.title
            );
            results.push({ size, ...result });
          }
        }
      }
    }

    return {
      success: true,
      results,
      message: `Processed restock notifications for ${results.length} sizes`,
    };
  } catch (error) {
    console.error("Error triggering restock notifications:", error);
    return { success: false, error };
  }
}

// ============================================
// EMAIL HTML TEMPLATES
// ============================================

function generateWelcomeEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to WEZZA</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">WEZZA</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #E37025; margin-top: 0;">Welcome${name ? `, ${name}` : ""}! 👋</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                Thanks for joining the WEZZA family! We're excited to have you here.
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                At WEZZA, we believe in <strong>quality over quantity</strong>. Every hoodie is crafted from premium 350gsm heavyweight cotton – designed to be lived in, not just worn.
              </p>

              <h3 style="color: #000000; margin-top: 30px;">What's Next?</h3>

              <ul style="color: #333333; font-size: 16px; line-height: 1.8;">
                <li>Browse our <strong>Core</strong>, <strong>Lunar</strong>, and <strong>Custom</strong> collections</li>
                <li>Enjoy <strong>free shipping</strong> on orders over $100 CAD</li>
                <li>Get first dibs on new drops and exclusive offers</li>
              </ul>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${SITE_URL}/shop" style="background-color: #E37025; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Start Shopping
                </a>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                Questions? Just reply to this email – we're here to help!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 WEZZA. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateCartAbandonmentEmailHTML(
  items: CartItem[],
  total: number
): string {
  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
        <strong style="color: #000000;">${item.title}</strong><br>
        <span style="color: #666666; font-size: 14px;">Size: ${item.size} • Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right;">
        <strong style="color: #000000;">${formatPrice(item.price * item.quantity, "CAD")}</strong>
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Cart is Waiting</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">WEZZA</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #E37025; margin-top: 0;">You Left Something Behind! 🛒</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                We noticed you didn't complete your order. Your items are still waiting for you!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                ${itemsHTML}
                <tr>
                  <td style="padding: 15px; text-align: right;" colspan="2">
                    <strong style="color: #000000; font-size: 18px;">Total: ${formatPrice(total, "CAD")}</strong>
                  </td>
                </tr>
              </table>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                Don't miss out on these premium hoodies. Complete your order now!
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${SITE_URL}/cart" style="background-color: #E37025; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Complete Your Order
                </a>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                Free shipping on orders over $100 CAD • 30-day returns
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 WEZZA. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generatePostPurchaseEmailHTML(
  name: string,
  items: CartItem[],
  orderId: string
): string {
  const productSlugs = items.map((item) => item.slug).join(",");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How's Your WEZZA?</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">WEZZA</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #E37025; margin-top: 0;">How's Your Hoodie? ⭐</h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                Hey${name ? ` ${name}` : ""}!
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                It's been a week since your WEZZA hoodie arrived. We'd love to hear what you think!
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                Your feedback helps us improve and helps other customers make informed decisions.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${SITE_URL}/product/${productSlugs}?review=true" style="background-color: #E37025; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Leave a Review
                </a>
              </div>

              <div style="background-color: #FAD4C0; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <h3 style="color: #000000; margin-top: 0;">Share Your Style!</h3>
                <p style="color: #333333; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                  Tag us <strong>@wezza</strong> on Instagram for a chance to be featured on our page!
                </p>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                Need help with anything? Reply to this email or check out our <a href="${SITE_URL}/contact" style="color: #E37025;">FAQ page</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 WEZZA. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateRestockEmailHTML(
  productTitle: string,
  size: string,
  productSlug: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Back in Stock!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">WEZZA</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #E37025; color: #ffffff; display: inline-block; padding: 12px 24px; border-radius: 4px; font-size: 14px; font-weight: bold; margin-bottom: 20px;">
                  BACK IN STOCK
                </div>
              </div>

              <h2 style="color: #000000; margin-top: 0; text-align: center; font-size: 28px;">
                Good News! 🎉
              </h2>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
                The item you've been waiting for is back in stock!
              </p>

              <div style="background-color: #FAD4C0; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 24px;">
                  ${productTitle}
                </h3>
                <p style="color: #666666; font-size: 18px; margin: 0;">
                  <strong>Size: ${size}</strong>
                </p>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
                Don't miss out – sizes sell fast! Grab yours before it's gone again.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${SITE_URL}/product/${productSlug}" style="background-color: #E37025; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 18px;">
                  Shop Now
                </a>
              </div>

              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 30px 0; border-left: 4px solid #E37025;">
                <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong>💡 Pro Tip:</strong> Order soon! Popular sizes and colors tend to sell out quickly. Plus, enjoy <strong>free shipping on orders over $100 CAD</strong>.
                </p>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
                You're receiving this because you joined the waitlist for this item.<br>
                Don't want these updates? Reply to this email and we'll remove you from the waitlist.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 WEZZA. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
