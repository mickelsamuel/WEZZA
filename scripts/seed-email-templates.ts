import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding email templates...");

  const templates = [
    {
      key: "order-confirmation",
      name: "Order Confirmation",
      description: "Sent to customers when their order is confirmed",
      subject: "Order Confirmation - Order #{{orderNumber}}",
      category: "transactional",
      active: true,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #E37025; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .order-details { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .order-details h2 { margin-top: 0; color: #E37025; }
    .item { border-bottom: 1px solid #ddd; padding: 15px 0; }
    .item:last-child { border-bottom: none; }
    .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #E37025; }
    .footer { background-color: #333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; margin-top: 30px; }
    .button { display: inline-block; background-color: #E37025; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Order!</h1>
    </div>

    <div class="content">
      <p>Hi {{customerName}},</p>

      <p>We've received your order and will send you a shipping confirmation email as soon as your order ships.</p>

      <div class="order-details">
        <h2>Order #{{orderNumber}}</h2>
        <p><strong>Order Date:</strong> {{orderDate}}</p>
        <p><strong>Email:</strong> {{customerEmail}}</p>

        <h3>Order Items:</h3>
        {{orderItems}}

        <div class="total">
          <p>Total: {{orderTotal}}</p>
        </div>
      </div>

      <p><strong>Shipping Address:</strong><br>
      {{shippingAddress}}</p>

      <p>If you have any questions about your order, please don't hesitate to contact us.</p>
    </div>

    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:wezza28711@gmail.com" style="color: #E37025;">wezza28711@gmail.com</a></p>
      <p>&copy; 2025 WEZZA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      variables: ["customerName", "orderNumber", "orderDate", "customerEmail", "orderItems", "orderTotal", "shippingAddress"],
    },
    {
      key: "shipping-notification",
      name: "Shipping Notification",
      description: "Sent when order has been shipped",
      subject: "Your Order #{{orderNumber}} Has Shipped!",
      category: "transactional",
      active: true,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipping Notification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #E37025; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .tracking-box { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
    .tracking-box h2 { margin-top: 0; color: #E37025; }
    .tracking-number { font-size: 24px; font-weight: bold; color: #E37025; margin: 15px 0; }
    .button { display: inline-block; background-color: #E37025; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Order Is On Its Way!</h1>
    </div>

    <div class="content">
      <p>Hi {{customerName}},</p>

      <p>Great news! Your order #{{orderNumber}} has been shipped and is on its way to you.</p>

      <div class="tracking-box">
        <h2>Tracking Information</h2>
        <p><strong>Carrier:</strong> {{carrier}}</p>
        <div class="tracking-number">{{trackingNumber}}</div>
        <a href="{{trackingUrl}}" class="button">Track Your Package</a>
      </div>

      <p><strong>Shipping To:</strong><br>
      {{shippingAddress}}</p>

      <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>

      <p>Thank you for shopping with WEZZA!</p>
    </div>

    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:wezza28711@gmail.com" style="color: #E37025;">wezza28711@gmail.com</a></p>
      <p>&copy; 2025 WEZZA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      variables: ["customerName", "orderNumber", "carrier", "trackingNumber", "trackingUrl", "shippingAddress", "estimatedDelivery"],
    },
    {
      key: "delivery-confirmation",
      name: "Delivery Confirmation",
      description: "Sent when order has been delivered",
      subject: "Your Order #{{orderNumber}} Has Been Delivered",
      category: "transactional",
      active: true,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #E37025; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .delivery-box { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
    .checkmark { font-size: 48px; color: #4CAF50; }
    .button { display: inline-block; background-color: #E37025; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Order Has Been Delivered!</h1>
    </div>

    <div class="content">
      <p>Hi {{customerName}},</p>

      <div class="delivery-box">
        <div class="checkmark">✓</div>
        <h2>Order #{{orderNumber}} Delivered</h2>
        <p><strong>Delivered on:</strong> {{deliveryDate}}</p>
      </div>

      <p>We hope you love your new WEZZA hoodie! We'd love to hear what you think.</p>

      <p style="text-align: center;">
        <a href="{{reviewUrl}}" class="button">Leave a Review</a>
      </p>

      <p>Tag us on Instagram <a href="https://www.instagram.com/wezza_ca" style="color: #E37025;">@wezza_ca</a> to be featured on our page!</p>

      <p>Thank you for choosing WEZZA!</p>
    </div>

    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:wezza28711@gmail.com" style="color: #E37025;">wezza28711@gmail.com</a></p>
      <p>&copy; 2025 WEZZA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      variables: ["customerName", "orderNumber", "deliveryDate", "reviewUrl"],
    },
    {
      key: "welcome",
      name: "Welcome Email",
      description: "Sent to new customers after first purchase",
      subject: "Welcome to WEZZA!",
      category: "marketing",
      active: true,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to WEZZA</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #E37025; color: #ffffff; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; }
    .content { padding: 30px 20px; }
    .feature-box { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background-color: #E37025; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to the WEZZA Family!</h1>
    </div>

    <div class="content">
      <p>Hi {{customerName}},</p>

      <p>Thank you for joining us! We're thrilled to have you as part of the WEZZA community.</p>

      <div class="feature-box">
        <h2>What Makes WEZZA Special?</h2>
        <ul>
          <li><strong>Premium Quality:</strong> Every hoodie is crafted with the finest materials</li>
          <li><strong>Unique Designs:</strong> Limited edition collections you won't find anywhere else</li>
          <li><strong>Perfect Fit:</strong> Designed for comfort and style</li>
          <li><strong>Fast Shipping:</strong> Get your order delivered quickly across Canada</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="{{shopUrl}}" class="button">Shop New Arrivals</a>
      </p>

      <p>Follow us on Instagram <a href="https://www.instagram.com/wezza_ca" style="color: #E37025;">@wezza_ca</a> for exclusive drops, behind-the-scenes content, and style inspiration!</p>

      <p>Welcome aboard,<br>The WEZZA Team</p>
    </div>

    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:wezza28711@gmail.com" style="color: #E37025;">wezza28711@gmail.com</a></p>
      <p>&copy; 2025 WEZZA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      variables: ["customerName", "shopUrl"],
    },
    {
      key: "cart-abandonment",
      name: "Cart Abandonment Reminder",
      description: "Sent to customers who left items in cart",
      subject: "You Left Something Behind! {{customerName}}",
      category: "marketing",
      active: true,
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Order</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #E37025; color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .cart-items { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background-color: #E37025; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #333; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Still Thinking About It?</h1>
    </div>

    <div class="content">
      <p>Hi {{customerName}},</p>

      <p>We noticed you left some items in your cart. They're still waiting for you!</p>

      <div class="cart-items">
        <h2>Your Cart:</h2>
        {{cartItems}}
        <p><strong>Total:</strong> {{cartTotal}}</p>
      </div>

      <p style="text-align: center;">
        <a href="{{cartUrl}}" class="button">Complete Your Purchase</a>
      </p>

      <p>These items are popular and may sell out soon. Complete your order now to secure your favorites!</p>

      <p>Need help deciding? Check out our <a href="{{sizeGuideUrl}}" style="color: #E37025;">size guide</a> or <a href="mailto:wezza28711@gmail.com" style="color: #E37025;">contact us</a> with any questions.</p>
    </div>

    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:wezza28711@gmail.com" style="color: #E37025;">wezza28711@gmail.com</a></p>
      <p>&copy; 2025 WEZZA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      variables: ["customerName", "cartItems", "cartTotal", "cartUrl", "sizeGuideUrl"],
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template,
    });
    console.log(`✓ Created/Updated template: ${template.name}`);
  }

  console.log("\n✅ Email templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding email templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
