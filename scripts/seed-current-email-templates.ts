import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding email templates...');

  const templates = [
    {
      key: 'payment-instructions',
      name: 'Payment Instructions (E-Transfer)',
      description: 'Sent to customers after they place an order, with e-transfer payment instructions',
      subject: 'Payment Instructions - Order #{{orderNumber}}',
      category: 'transactional',
      variables: JSON.stringify(['orderNumber', 'customerName', 'total', 'items', 'etransferEmail', 'expiresAt', 'siteUrl']),
      htmlContent: '<p>Hi {{customerName}},</p><p>Thank you for your order #{{orderNumber}}! Please send ${{total}} CAD via e-transfer to {{etransferEmail}}. Include your order number in the message.</p><p>Payment expires: {{expiresAt}}</p>',
      active: true,
    },
    {
      key: 'payment-confirmation',
      name: 'Payment Confirmation & Receipt',
      description: 'Sent when admin confirms e-transfer payment was received',
      subject: 'Payment Confirmed - Order #{{orderNumber}}',
      category: 'transactional',
      variables: JSON.stringify(['orderNumber', 'customerName', 'total', 'paymentConfirmedAt', 'siteUrl']),
      htmlContent: '<h1>Payment Confirmed!</h1><p>Hi {{customerName}},</p><p>We have received your payment of ${{total}} CAD for order #{{orderNumber}}. Your order is now being prepared for shipment.</p><p>Payment confirmed on: {{paymentConfirmedAt}}</p>',
      active: true,
    },
    {
      key: 'shipping-confirmation',
      name: 'Shipping Confirmation',
      description: 'Sent when order ships with tracking information',
      subject: 'Your Order Has Shipped! - #{{orderNumber}}',
      category: 'transactional',
      variables: JSON.stringify(['orderNumber', 'customerName', 'trackingNumber', 'carrier', 'siteUrl']),
      htmlContent: '<h1>Your Order Has Shipped!</h1><p>Hi {{customerName}},</p><p>Great news! Your order #{{orderNumber}} is on its way.</p><p>Tracking Number: {{trackingNumber}}</p><p>Carrier: {{carrier}}</p>',
      active: true,
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template,
    });
    console.log(`✓ Seeded template: ${template.name}`);
  }

  console.log('Email templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding email templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
