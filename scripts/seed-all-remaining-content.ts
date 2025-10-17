import { prisma } from "../lib/prisma";

// All remaining content that needs to be added to the database
const ADDITIONAL_CONTENT = [
  // Product Detail Page
  { key: "product.backToShop", value: "Back to Shop", section: "product", description: "Back to shop button text" },
  { key: "product.outOfStock", value: "Out of Stock", section: "product", description: "Out of stock badge" },
  { key: "product.accordion.fabric", value: "Fabric & Construction", section: "product", description: "Fabric accordion label" },
  { key: "product.accordion.care", value: "Care Instructions", section: "product", description: "Care accordion label" },
  { key: "product.accordion.shipping", value: "Shipping & Returns", section: "product", description: "Shipping accordion label" },
  { key: "product.reviews.title", value: "Customer Reviews", section: "product", description: "Reviews section title" },

  // Filters Component
  { key: "filters.sort.label", value: "Sort By", section: "filters", description: "Sort label" },
  { key: "filters.sort.placeholder", value: "Select sorting", section: "filters", description: "Sort placeholder" },
  { key: "filters.sort.newest", value: "Newest", section: "filters", description: "Sort option: newest" },
  { key: "filters.sort.priceLow", value: "Price: Low to High", section: "filters", description: "Sort option: price low to high" },
  { key: "filters.sort.priceHigh", value: "Price: High to Low", section: "filters", description: "Sort option: price high to low" },
  { key: "filters.color.label", value: "Color", section: "filters", description: "Color filter label" },
  { key: "filters.color.black", value: "Black", section: "filters", description: "Color: black" },
  { key: "filters.color.white", value: "White", section: "filters", description: "Color: white" },
  { key: "filters.color.orange", value: "Burnt Orange", section: "filters", description: "Color: burnt orange" },
  { key: "filters.color.peach", value: "Peach", section: "filters", description: "Color: peach" },
  { key: "filters.color.gray", value: "Warm Gray", section: "filters", description: "Color: gray" },
  { key: "filters.size.label", value: "Size", section: "filters", description: "Size filter label" },
  { key: "filters.collection.label", value: "Collection", section: "filters", description: "Collection filter label" },
  { key: "filters.reset", value: "Reset Filters", section: "filters", description: "Reset filters button" },

  // Product Card
  { key: "productCard.new", value: "NEW", section: "productCard", description: "New product badge" },
  { key: "productCard.bestseller", value: "BESTSELLER", section: "productCard", description: "Bestseller badge" },
  { key: "productCard.outOfStock", value: "Out of Stock", section: "productCard", description: "Out of stock text" },

  // Mobile Nav
  { key: "mobileNav.menu", value: "Menu", section: "mobileNav", description: "Menu header" },
  { key: "mobileNav.myAccount", value: "My Account", section: "mobileNav", description: "My account link" },
  { key: "mobileNav.signOut", value: "Sign Out", section: "mobileNav", description: "Sign out button" },
  { key: "mobileNav.signIn", value: "Sign In", section: "mobileNav", description: "Sign in button" },

  // Search Bar
  { key: "search.placeholder", value: "Search hoodies, colors, collections...", section: "search", description: "Search placeholder" },
  { key: "search.ariaLabel", value: "Search products", section: "search", description: "Search aria label" },
  { key: "search.escKey", value: "ESC", section: "search", description: "Escape key label" },
  { key: "search.results.title", value: "Search Results", section: "search", description: "Search results title" },
  { key: "search.results.searching", value: "Searching...", section: "search", description: "Searching text" },
  { key: "search.results.found", value: "Found", section: "search", description: "Found results text" },
  { key: "search.results.result", value: "result", section: "search", description: "Result singular" },
  { key: "search.results.results", value: "results", section: "search", description: "Results plural" },
  { key: "search.results.for", value: "for", section: "search", description: "For text" },
  { key: "search.results.noResults", value: "No results found for", section: "search", description: "No results text" },
  { key: "search.results.noMatch", value: "No products match your search. Try different keywords.", section: "search", description: "No match message" },
  { key: "search.results.browseAll", value: "Browse All Products", section: "search", description: "Browse all button" },

  // Related Products
  { key: "relatedProducts.title", value: "You May Also Like", section: "relatedProducts", description: "Related products title" },
  { key: "relatedProducts.viewAll", value: "View All", section: "relatedProducts", description: "View all link" },

  // Header (additional)
  { key: "header.logoAlt", value: "WEZZA Logo", section: "navigation", description: "Logo alt text" },
];

async function main() {
  console.log("🌱 Seeding additional content...");

  let added = 0;
  let updated = 0;

  for (const item of ADDITIONAL_CONTENT) {
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
  console.log(`   📊 Total: ${ADDITIONAL_CONTENT.length} items processed`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
