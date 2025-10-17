import { prisma } from "../lib/prisma";

// Final remaining hardcoded content keys
const REMAINING_CONTENT = [
  // Recently Viewed Section (~2 strings)
  { key: "recentlyViewed.heading", value: "Recently Viewed", section: "recentlyViewed", description: "Section heading" },
  { key: "recentlyViewed.description", value: "Pick up where you left off", section: "recentlyViewed", description: "Section description" },

  // Search Results Modal (~6 strings)
  { key: "searchResults.heading", value: "Search Results", section: "searchResults", description: "Modal heading" },
  { key: "searchResults.loading", value: "Searching...", section: "searchResults", description: "Loading state" },
  { key: "searchResults.singular", value: "result", section: "searchResults", description: "Result singular" },
  { key: "searchResults.plural", value: "results", section: "searchResults", description: "Results plural" },
  { key: "searchResults.noResults", value: "No results found", section: "searchResults", description: "No results message" },
  { key: "searchResults.noMatch", value: "No products match your search. Try different keywords.", section: "searchResults", description: "No match description" },
  { key: "searchResults.browseAll", value: "Browse All Products", section: "searchResults", description: "Browse all button" },

  // Add To Cart Component (~13 additional strings)
  { key: "addToCart.toast.selectSize.title", value: "Please select a size", section: "addToCart", description: "Select size toast title" },
  { key: "addToCart.toast.selectSize.description", value: "Choose a size before adding to cart.", section: "addToCart", description: "Select size toast description" },
  { key: "addToCart.toast.outOfStock.title", value: "Out of stock", section: "addToCart", description: "Out of stock toast title" },
  { key: "addToCart.toast.outOfStock.inSize", value: "in size", section: "addToCart", description: "In size text" },
  { key: "addToCart.toast.outOfStock.unavailable", value: "is currently unavailable", section: "addToCart", description: "Unavailable text" },
  { key: "addToCart.toast.insufficient.title", value: "Insufficient stock", section: "addToCart", description: "Insufficient stock toast title" },
  { key: "addToCart.toast.insufficient.only", value: "Only", section: "addToCart", description: "Only text" },
  { key: "addToCart.toast.insufficient.available", value: "items available in size", section: "addToCart", description: "Available text" },
  { key: "addToCart.toast.added.title", value: "Added to cart", section: "addToCart", description: "Added toast title" },

  // Size Recommendation Modal Errors (~3 strings)
  { key: "sizeRec.error.requiredFields", value: "Please enter your height and weight", section: "sizeRec", description: "Required fields error" },
  { key: "sizeRec.error.calculateFailed", value: "Failed to calculate size", section: "sizeRec", description: "Calculate failed error" },
  { key: "sizeRec.error.calculationError", value: "Failed to calculate recommended size", section: "sizeRec", description: "Calculation error message" },
];

async function main() {
  console.log("🌱 Seeding remaining content...");

  let added = 0;
  let updated = 0;

  for (const item of REMAINING_CONTENT) {
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
  console.log(`   📊 Total: ${REMAINING_CONTENT.length} items processed`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
