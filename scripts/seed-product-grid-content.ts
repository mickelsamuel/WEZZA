import { prisma } from "../lib/prisma";

// Product grid content
const PRODUCT_GRID_CONTENT = [
  {
    key: "productGrid.empty",
    value: "No products found matching your criteria.",
    section: "productGrid",
    description: "Empty state message when no products match filters"
  },
];

async function main() {
  console.log("🌱 Seeding product grid content...");

  let added = 0;
  let updated = 0;

  for (const item of PRODUCT_GRID_CONTENT) {
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
  console.log(`   📊 Total: ${PRODUCT_GRID_CONTENT.length} items processed`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
