import { prisma } from "../lib/prisma";

async function main() {
  console.log("📊 CONTENT ORGANIZATION REPORT\n");
  console.log("=" .repeat(80));

  // Get all sections with counts
  const allContent = await prisma.siteContent.findMany({
    select: {
      section: true,
    },
  });

  // Group by section
  const sectionCounts: Record<string, number> = {};
  allContent.forEach((item) => {
    sectionCounts[item.section] = (sectionCounts[item.section] || 0) + 1;
  });

  // Sort sections alphabetically
  const sortedSections = Object.entries(sectionCounts).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  console.log("\n📑 CONTENT BY SECTION:\n");

  let totalItems = 0;
  sortedSections.forEach(([section, count]) => {
    console.log(`   ${section.padEnd(25)} ${count.toString().padStart(4)} items`);
    totalItems += count;
  });

  console.log("\n" + "=".repeat(80));
  console.log(`\n✅ TOTAL SECTIONS: ${sortedSections.length}`);
  console.log(`✅ TOTAL CONTENT ITEMS: ${totalItems}\n`);

  // Check for any sections not in SECTION_INFO
  const SECTION_INFO_KEYS = [
    "header", "navigation", "footer", "hero", "home", "about", "contact", "custom",
    "shop", "product", "cart", "checkout", "checkoutSuccess", "checkoutCancel",
    "productCard", "addToCart", "filters", "reviews", "relatedProducts", "bestsellers", "recentlyViewed",
    "auth", "user", "account", "wishlist", "wishlistButton",
    "sizeGuide", "sizeRec", "stockIndicator", "stockNotification",
    "search", "searchResults",
    "instagram", "mobileNav", "orders", "productGrid"
  ];

  const missingSections = sortedSections
    .map(([section]) => section)
    .filter(section => !SECTION_INFO_KEYS.includes(section));

  if (missingSections.length > 0) {
    console.log("⚠️  SECTIONS NOT IN SECTION_INFO:");
    missingSections.forEach(section => {
      console.log(`   - ${section} (${sectionCounts[section]} items)`);
    });
  } else {
    console.log("✅ All sections are properly configured in SECTION_INFO\n");
  }

  // Sample some content keys for verification
  console.log("\n📋 SAMPLE CONTENT KEYS (first 5 per section):\n");

  for (const [section] of sortedSections.slice(0, 10)) {
    const sampleKeys = await prisma.siteContent.findMany({
      where: { section },
      select: { key: true },
      take: 5,
    });

    console.log(`\n${section}:`);
    sampleKeys.forEach(item => {
      console.log(`   • ${item.key}`);
    });
  }

  console.log("\n" + "=".repeat(80));
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
