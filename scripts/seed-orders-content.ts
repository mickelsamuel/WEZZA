import { prisma } from "../lib/prisma";

// Orders page content keys
const ORDERS_CONTENT = [
  // Status labels
  { key: "orders.status.pending", value: "Order Placed", section: "orders", description: "Pending status label" },
  { key: "orders.status.processing", value: "Processing", section: "orders", description: "Processing status label" },
  { key: "orders.status.shipped", value: "Shipped", section: "orders", description: "Shipped status label" },
  { key: "orders.status.delivered", value: "Delivered", section: "orders", description: "Delivered status label" },

  // Not found state
  { key: "orders.notFound.title", value: "Order Not Found", section: "orders", description: "Not found page title" },
  { key: "orders.notFound.viewAll", value: "View all orders", section: "orders", description: "View all orders link" },

  // Navigation and header
  { key: "orders.backToAccount", value: "← Back to Account", section: "orders", description: "Back to account link" },
  { key: "orders.pageTitle", value: "Track Your Order", section: "orders", description: "Page title" },
  { key: "orders.orderNumber", value: "Order", section: "orders", description: "Order number prefix" },

  // Progress section
  { key: "orders.progress.title", value: "Order Progress", section: "orders", description: "Progress card title" },

  // Tracking information
  { key: "orders.tracking.title", value: "Tracking Information", section: "orders", description: "Tracking card title" },
  { key: "orders.tracking.carrier", value: "Carrier", section: "orders", description: "Carrier label" },
  { key: "orders.tracking.number", value: "Tracking Number", section: "orders", description: "Tracking number label" },

  // Order items
  { key: "orders.items.title", value: "Order Items", section: "orders", description: "Items card title" },
  { key: "orders.items.size", value: "Size", section: "orders", description: "Size label" },
  { key: "orders.items.quantity", value: "Quantity", section: "orders", description: "Quantity label" },
  { key: "orders.items.total", value: "Total", section: "orders", description: "Total label" },

  // Shipping address
  { key: "orders.shipping.title", value: "Shipping Address", section: "orders", description: "Shipping card title" },

  // Order details
  { key: "orders.details.title", value: "Order Details", section: "orders", description: "Details card title" },
  { key: "orders.details.date", value: "Order Date", section: "orders", description: "Order date label" },
  { key: "orders.details.id", value: "Order ID", section: "orders", description: "Order ID label" },

  // Status updates
  { key: "orders.statusUpdates.title", value: "Status Updates", section: "orders", description: "Status updates card title" },

  // Help section
  { key: "orders.help.question", value: "Need help with your order?", section: "orders", description: "Help question text" },
  { key: "orders.help.contact", value: "Contact Support", section: "orders", description: "Contact support link" },
];

async function main() {
  console.log("🌱 Seeding orders page content...");

  let added = 0;
  let updated = 0;

  for (const item of ORDERS_CONTENT) {
    const existing = await prisma.siteContent.findUnique({
      where: { key: item.key },
    });

    if (existing) {
      await prisma.siteContent.update({
        where: { key: item.key },
        data: item,
      });
      updated++;
    } else {
      await prisma.siteContent.create({
        data: item,
      });
      added++;
    }
  }

  console.log(`✅ Seeding complete!`);
  console.log(`   📝 Added: ${added} new items`);
  console.log(`   ♻️  Updated: ${updated} existing items`);
  console.log(`   📊 Total: ${ORDERS_CONTENT.length} items processed`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
