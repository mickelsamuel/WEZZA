// Email templates for WEZZA Store
// Using inline styles for email compatibility

import { escapeHtml } from './security';

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    title: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

export interface ShippingConfirmationData {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
}

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    background-color: #000000;
    padding: 32px;
    text-align: center;
  }
  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 2px;
  }
  .content {
    padding: 40px 32px;
  }
  .title {
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 16px 0;
    color: #000000;
  }
  .text {
    font-size: 16px;
    line-height: 24px;
    color: #333333;
    margin: 0 0 16px 0;
  }
  .button {
    display: inline-block;
    background-color: #E37025;
    color: #ffffff !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    margin: 24px 0;
  }
  .order-details {
    background-color: #f9f9f9;
    padding: 24px;
    border-radius: 12px;
    margin: 24px 0;
  }
  .order-item {
    padding: 16px 0;
    border-bottom: 1px solid #e0e0e0;
  }
  .order-item:last-child {
    border-bottom: none;
  }
  .item-name {
    font-weight: 600;
    font-size: 16px;
    color: #000000;
  }
  .item-details {
    font-size: 14px;
    color: #666666;
    margin-top: 4px;
  }
  .order-summary {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 2px solid #000000;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    font-size: 16px;
  }
  .summary-total {
    font-weight: bold;
    font-size: 20px;
    margin-top: 8px;
  }
  .tracking-box {
    background-color: #f0f0f0;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    margin: 24px 0;
  }
  .tracking-number {
    font-family: monospace;
    font-size: 20px;
    font-weight: bold;
    color: #000000;
    letter-spacing: 2px;
  }
  .footer {
    background-color: #f5f5f5;
    padding: 32px;
    text-align: center;
    font-size: 14px;
    color: #666666;
  }
  .footer-link {
    color: #E37025;
    text-decoration: none;
  }
`;

export function generateOrderConfirmationEmail(data: OrderConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">WEZZA</div>
    </div>

    <div class="content">
      <h1 class="title">Order Confirmed!</h1>

      <p class="text">
        Hey ${escapeHtml(data.customerName)},
      </p>

      <p class="text">
        Thanks for your order! We're preparing your items for shipment. You'll receive another email once your order ships.
      </p>

      <p class="text">
        <strong>Order Number:</strong> #${escapeHtml(data.orderNumber)}
      </p>

      <div class="order-details">
        <h2 style="margin: 0 0 16px 0; font-size: 18px;">Order Items</h2>
        ${data.items.map(item => `
          <div class="order-item">
            <div class="item-name">${escapeHtml(item.title)}</div>
            <div class="item-details">
              Size: ${escapeHtml(item.size)} • Quantity: ${item.quantity} • $${(item.price / 100).toFixed(2)} CAD
            </div>
          </div>
        `).join('')}

        <div class="order-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>$${(data.subtotal / 100).toFixed(2)} CAD</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>${data.shipping === 0 ? 'FREE' : `$${(data.shipping / 100).toFixed(2)} CAD`}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total</span>
            <span>$${(data.total / 100).toFixed(2)} CAD</span>
          </div>
        </div>
      </div>

      <div style="margin: 24px 0;">
        <h3 style="font-size: 16px; margin: 0 0 8px 0;">Shipping Address</h3>
        <p class="text" style="margin: 0;">
          ${escapeHtml(data.shippingAddress.street)}<br>
          ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.province)} ${escapeHtml(data.shippingAddress.postalCode)}<br>
          ${escapeHtml(data.shippingAddress.country)}
        </p>
      </div>

      <center>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}/orders/${escapeHtml(data.orderNumber)}" class="button">
          Track Your Order
        </a>
      </center>
    </div>

    <div class="footer">
      <p>
        Questions? Contact us at
        <a href="mailto:wezza28711@gmail.com" class="footer-link">wezza28711@gmail.com</a>
      </p>
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}" class="footer-link">wezza-store.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateShippingConfirmationEmail(data: ShippingConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">WEZZA</div>
    </div>

    <div class="content">
      <h1 class="title">Your Order Has Shipped!</h1>

      <p class="text">
        Hey ${escapeHtml(data.customerName)},
      </p>

      <p class="text">
        Great news! Your WEZZA order is on its way. ${data.estimatedDelivery ? `It should arrive by ${escapeHtml(data.estimatedDelivery)}.` : ''}
      </p>

      <p class="text">
        <strong>Order Number:</strong> #${escapeHtml(data.orderNumber)}
      </p>

      <div class="tracking-box">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #666666;">Tracking Number</p>
        <div class="tracking-number">${escapeHtml(data.trackingNumber)}</div>
        <p style="margin: 12px 0 0 0; font-size: 14px; color: #666666;">Carrier: ${escapeHtml(data.carrier)}</p>
      </div>

      <center>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}/orders/${escapeHtml(data.orderNumber)}" class="button">
          Track Your Order
        </a>
      </center>

      <p class="text" style="margin-top: 32px;">
        We hope you love your new hoodie! Share your style with us on Instagram @wezza.
      </p>
    </div>

    <div class="footer">
      <p>
        Questions? Contact us at
        <a href="mailto:wezza28711@gmail.com" class="footer-link">wezza28711@gmail.com</a>
      </p>
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}" class="footer-link">wezza-store.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export interface PaymentConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    title: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  paymentConfirmedAt: Date;
}

export function generatePaymentConfirmationEmail(data: PaymentConfirmationData): string {
  const formattedDate = data.paymentConfirmedAt.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">WEZZA</div>
    </div>

    <div class="content">
      <div style="background-color: #D4EDDA; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 2px solid #28A745; text-align: center;">
        <h1 style="margin: 0; color: #155724; font-size: 28px;">✓ Payment Confirmed!</h1>
        <p style="margin: 10px 0 0 0; color: #155724; font-size: 16px;">Your order is now being prepared for shipment.</p>
      </div>

      <p class="text">
        Hey ${escapeHtml(data.customerName)},
      </p>

      <p class="text">
        We've received and confirmed your e-transfer payment. Your order is now being processed and will be shipped soon!
      </p>

      <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
        <h3 style="margin-top: 0; color: #000;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
            <td style="padding: 8px 0; text-align: right;">#${escapeHtml(data.orderNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Payment Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #28A745;">$${(data.total / 100).toFixed(2)} CAD</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
            <td style="padding: 8px 0; text-align: right;">E-Transfer</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Payment Date:</td>
            <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <div class="order-details">
        <h2 style="margin: 0 0 16px 0; font-size: 18px;">Order Summary</h2>
        ${data.items.map(item => `
          <div class="order-item">
            <div class="item-name">${escapeHtml(item.title)}</div>
            <div class="item-details">
              Size: ${escapeHtml(item.size)} • Quantity: ${item.quantity} • $${(item.price / 100).toFixed(2)} CAD
            </div>
          </div>
        `).join('')}

        <div class="order-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>$${(data.total / 100).toFixed(2)} CAD</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total Paid</span>
            <span>$${(data.total / 100).toFixed(2)} CAD</span>
          </div>
        </div>
      </div>

      <div style="margin: 24px 0;">
        <h3 style="font-size: 16px; margin: 0 0 8px 0;">Shipping Address</h3>
        <p class="text" style="margin: 0;">
          <strong>${escapeHtml(data.shippingAddress.name)}</strong><br>
          ${escapeHtml(data.shippingAddress.street)}<br>
          ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.province)} ${escapeHtml(data.shippingAddress.postalCode)}<br>
          ${escapeHtml(data.shippingAddress.country)}
        </p>
      </div>

      <div style="background-color: #E8F4F8; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #0066CC;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0066CC;">What's Next?</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin: 6px 0;">Your order is being prepared for shipment</li>
          <li style="margin: 6px 0;">You'll receive tracking information once shipped</li>
          <li style="margin: 6px 0;">Estimated delivery: 5-7 business days</li>
        </ul>
      </div>

      <div style="background-color: #FFF8E7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35;">
        <p style="margin: 0; font-size: 13px;"><strong>📧 Check Your Spam Folder:</strong> Our emails sometimes end up in spam. Please check your spam/junk folder and mark us as "Not Spam" to ensure you receive shipping updates.</p>
      </div>

      <center>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}/orders/${escapeHtml(data.orderNumber)}" class="button">
          Track Your Order
        </a>
      </center>

      <p class="text" style="margin-top: 24px; font-size: 13px; color: #666;">
        This is your official payment receipt. Please keep it for your records.
      </p>
    </div>

    <div class="footer">
      <p>
        Questions? Contact us at
        <a href="mailto:wezza28711@gmail.com" class="footer-link">wezza28711@gmail.com</a>
      </p>
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}" class="footer-link">wezza-store.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateDeliveryNotificationEmail(customerName: string, orderNumber: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">WEZZA</div>
    </div>

    <div class="content">
      <h1 class="title">Order Delivered!</h1>

      <p class="text">
        Hey ${customerName},
      </p>

      <p class="text">
        Your WEZZA order has been delivered! We hope it exceeds your expectations.
      </p>

      <p class="text">
        <strong>Order Number:</strong> #${orderNumber}
      </p>

      <p class="text" style="margin-top: 32px;">
        Love your new hoodie? Share it with us! Tag <strong>@wezza</strong> on Instagram for a chance to be featured.
      </p>

      <center>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}/shop" class="button">
          Shop More Hoodies
        </a>
      </center>

      <p class="text" style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e0e0e0;">
        <strong>Need to return or exchange?</strong><br>
        We offer free returns within 30 days.
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}/account/returns" class="footer-link">Start a return</a>
      </p>
    </div>

    <div class="footer">
      <p>
        Questions? Contact us at
        <a href="mailto:wezza28711@gmail.com" class="footer-link">wezza28711@gmail.com</a>
      </p>
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wezza-store.vercel.app'}" class="footer-link">wezza-store.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
