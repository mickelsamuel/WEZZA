import { prisma } from "../lib/prisma";

// Final remaining components content (~150 strings)
const FINAL_CONTENT = [
  // Add to Cart Enhanced (~25 strings)
  { key: "addToCart.size.label", value: "Size", section: "addToCart", description: "Size label" },
  { key: "addToCart.findMySize", value: "Find My Size", section: "addToCart", description: "Find my size button" },
  { key: "addToCart.notifyWhenAvailable", value: "Notify Me When Available", section: "addToCart", description: "Notify button" },
  { key: "addToCart.someSizesOutOfStock", value: "Some sizes are out of stock", section: "addToCart", description: "Out of stock info" },
  { key: "addToCart.waitlistInfo", value: "Select an out-of-stock size to join the waitlist and get notified when it's back", section: "addToCart", description: "Waitlist info" },
  { key: "addToCart.quantity.label", value: "Quantity", section: "addToCart", description: "Quantity label" },
  { key: "addToCart.processing", value: "Processing...", section: "addToCart", description: "Processing state" },
  { key: "addToCart.buyNow", value: "Buy Now - Fast Checkout", section: "addToCart", description: "Buy now button" },
  { key: "addToCart.outOfStock", value: "Out of Stock", section: "addToCart", description: "Out of stock button" },
  { key: "addToCart.sizeOutOfStock", value: "Size Out of Stock", section: "addToCart", description: "Size out of stock button" },
  { key: "addToCart.addToCart", value: "Add to Cart", section: "addToCart", description: "Add to cart button" },
  { key: "addToCart.buyNowHelp", value: "Buy Now uses your saved address and payment method for instant checkout", section: "addToCart", description: "Buy now help text" },

  // Bestsellers Section (~6 strings)
  { key: "bestsellers.heading", value: "Bestsellers", section: "bestsellers", description: "Section heading" },
  { key: "bestsellers.description", value: "Our most popular hoodies, loved by the community", section: "bestsellers", description: "Section description" },
  { key: "bestsellers.shopAll", value: "Shop All", section: "bestsellers", description: "Shop all link" },
  { key: "bestsellers.shopAllHoodies", value: "Shop All Hoodies", section: "bestsellers", description: "Shop all hoodies link" },

  // Product Reviews (~20 strings)
  { key: "reviews.loading", value: "Loading reviews...", section: "reviews", description: "Loading text" },
  { key: "reviews.review", value: "review", section: "reviews", description: "Review singular" },
  { key: "reviews.reviews", value: "reviews", section: "reviews", description: "Reviews plural" },
  { key: "reviews.writeReview", value: "Write a Review", section: "reviews", description: "Write review button" },
  { key: "reviews.writeYourReview", value: "Write Your Review", section: "reviews", description: "Form heading" },
  { key: "reviews.rating.label", value: "Rating", section: "reviews", description: "Rating label" },
  { key: "reviews.comment.label", value: "Comment (optional)", section: "reviews", description: "Comment label" },
  { key: "reviews.comment.placeholder", value: "Share your experience with this product...", section: "reviews", description: "Comment placeholder" },
  { key: "reviews.submitting", value: "Submitting...", section: "reviews", description: "Submitting state" },
  { key: "reviews.submit", value: "Submit Review", section: "reviews", description: "Submit button" },
  { key: "reviews.cancel", value: "Cancel", section: "reviews", description: "Cancel button" },
  { key: "reviews.signInRequired", value: "Please sign in to write a review", section: "reviews", description: "Sign in required message" },
  { key: "reviews.empty", value: "No reviews yet. Be the first to review this product!", section: "reviews", description: "Empty state" },
  { key: "reviews.verifiedPurchase", value: "Verified Purchase", section: "reviews", description: "Verified badge" },
  { key: "reviews.helpful", value: "Helpful (", section: "reviews", description: "Helpful button prefix" },

  // Size Guide Modal (~35 strings)
  { key: "sizeGuide.button", value: "Size Guide", section: "sizeGuide", description: "Open button" },
  { key: "sizeGuide.title", value: "Size Guide - Hoodies", section: "sizeGuide", description: "Modal title" },
  { key: "sizeGuide.description", value: "All measurements are in inches. If you're between sizes, we recommend sizing up for a more relaxed fit.", section: "sizeGuide", description: "Modal description" },
  { key: "sizeGuide.table.size", value: "Size", section: "sizeGuide", description: "Table header" },
  { key: "sizeGuide.table.chest", value: "Chest Width", section: "sizeGuide", description: "Table header" },
  { key: "sizeGuide.table.length", value: "Length", section: "sizeGuide", description: "Table header" },
  { key: "sizeGuide.table.sleeve", value: "Sleeve Length", section: "sizeGuide", description: "Table header" },
  { key: "sizeGuide.howToMeasure", value: "How to Measure", section: "sizeGuide", description: "Subheading" },
  { key: "sizeGuide.measure.chest.label", value: "Chest Width", section: "sizeGuide", description: "Measurement label" },
  { key: "sizeGuide.measure.chest.instruction", value: "Measure across the chest from armpit to armpit", section: "sizeGuide", description: "Measurement instruction" },
  { key: "sizeGuide.measure.length.label", value: "Length", section: "sizeGuide", description: "Measurement label" },
  { key: "sizeGuide.measure.length.instruction", value: "Measure from the highest point of the shoulder to the bottom hem", section: "sizeGuide", description: "Measurement instruction" },
  { key: "sizeGuide.measure.sleeve.label", value: "Sleeve Length", section: "sizeGuide", description: "Measurement label" },
  { key: "sizeGuide.measure.sleeve.instruction", value: "Measure from the center back of the neck to the end of the sleeve", section: "sizeGuide", description: "Measurement instruction" },
  { key: "sizeGuide.fitGuide", value: "Fit Guide", section: "sizeGuide", description: "Subheading" },
  { key: "sizeGuide.fit.relaxed", value: "Our hoodies are designed with a slightly relaxed fit for maximum comfort", section: "sizeGuide", description: "Fit point" },
  { key: "sizeGuide.fit.preshrunk", value: "All garments are pre-shrunk to minimize further shrinkage", section: "sizeGuide", description: "Fit point" },
  { key: "sizeGuide.fit.between", value: "Between sizes? Size up for a more oversized look", section: "sizeGuide", description: "Fit point" },
  { key: "sizeGuide.fit.model", value: "Model is 6'0\" and wearing size Large", section: "sizeGuide", description: "Fit point" },
  { key: "sizeGuide.contact.text", value: "Still not sure? Contact us at", section: "sizeGuide", description: "Contact text" },
  { key: "sizeGuide.contact.email", value: "wezza28711@gmail.com", section: "sizeGuide", description: "Contact email" },

  // Stock Notification Modal (~20 strings)
  { key: "stockNotification.emailRequired", value: "Please enter your email address", section: "stockNotification", description: "Email required error" },
  { key: "stockNotification.title", value: "Join Waitlist", section: "stockNotification", description: "Modal title" },
  { key: "stockNotification.description", value: "Get notified when this item is back in stock", section: "stockNotification", description: "Modal description" },
  { key: "stockNotification.success.title", value: "You're on the list!", section: "stockNotification", description: "Success title" },
  { key: "stockNotification.success.message", value: "We'll send you an email as soon as this item is back in stock.", section: "stockNotification", description: "Success message" },
  { key: "stockNotification.product.label", value: "Product", section: "stockNotification", description: "Product label" },
  { key: "stockNotification.size.label", value: "Size: ", section: "stockNotification", description: "Size label" },
  { key: "stockNotification.email.label", value: "Email Address", section: "stockNotification", description: "Email label" },
  { key: "stockNotification.email.placeholder", value: "your@email.com", section: "stockNotification", description: "Email placeholder" },
  { key: "stockNotification.email.helper", value: "Using your account email", section: "stockNotification", description: "Email helper" },
  { key: "stockNotification.benefits.title", value: "What you'll get:", section: "stockNotification", description: "Benefits title" },
  { key: "stockNotification.benefits.instant", value: "Instant email notification when back in stock", section: "stockNotification", description: "Benefit 1" },
  { key: "stockNotification.benefits.exclusive", value: "Exclusive 24-hour early access before general release", section: "stockNotification", description: "Benefit 2" },
  { key: "stockNotification.benefits.noSpam", value: "No spam - only one notification per product", section: "stockNotification", description: "Benefit 3" },
  { key: "stockNotification.cancel", value: "Cancel", section: "stockNotification", description: "Cancel button" },
  { key: "stockNotification.joining", value: "Joining...", section: "stockNotification", description: "Joining state" },
  { key: "stockNotification.notify", value: "Notify Me", section: "stockNotification", description: "Notify button" },
  { key: "stockNotification.privacy", value: "By clicking \"Notify Me\", you agree to receive restock notifications via email.\nYou can unsubscribe anytime.", section: "stockNotification", description: "Privacy note" },
  { key: "stockNotification.error", value: "Failed to join waitlist. Please try again.", section: "stockNotification", description: "Error message" },

  // Search Bar (~3 strings)
  { key: "search.placeholder", value: "Search hoodies, colors, collections...", section: "search", description: "Search placeholder" },
  { key: "search.esc", value: "ESC", section: "search", description: "ESC key label" },

  // Size Recommendation Modal (~35 strings)
  { key: "sizeRec.title", value: "Find Your Perfect Size", section: "sizeRec", description: "Modal title" },
  { key: "sizeRec.description", value: "Enter your measurements to get a personalized size recommendation", section: "sizeRec", description: "Modal description" },
  { key: "sizeRec.loadingProfile", value: "Loading your profile...", section: "sizeRec", description: "Loading text" },
  { key: "sizeRec.recommended", value: "Your Recommended Size", section: "sizeRec", description: "Recommended label" },
  { key: "sizeRec.height.label", value: "Height (cm) *", section: "sizeRec", description: "Height label" },
  { key: "sizeRec.height.placeholder", value: "e.g., 175", section: "sizeRec", description: "Height placeholder" },
  { key: "sizeRec.weight.label", value: "Weight (kg) *", section: "sizeRec", description: "Weight label" },
  { key: "sizeRec.weight.placeholder", value: "e.g., 70", section: "sizeRec", description: "Weight placeholder" },
  { key: "sizeRec.chest.label", value: "Chest Measurement (cm) (optional)", section: "sizeRec", description: "Chest label" },
  { key: "sizeRec.chest.placeholder", value: "e.g., 105", section: "sizeRec", description: "Chest placeholder" },
  { key: "sizeRec.chest.help", value: "Measure around the fullest part of your chest", section: "sizeRec", description: "Chest help text" },
  { key: "sizeRec.fit.label", value: "Preferred Fit", section: "sizeRec", description: "Fit label" },
  { key: "sizeRec.fit.slim.title", value: "Slim Fit", section: "sizeRec", description: "Slim fit title" },
  { key: "sizeRec.fit.slim.desc", value: "Closer to body, more fitted", section: "sizeRec", description: "Slim fit description" },
  { key: "sizeRec.fit.regular.title", value: "Regular Fit", section: "sizeRec", description: "Regular fit title" },
  { key: "sizeRec.fit.regular.desc", value: "Classic, comfortable fit", section: "sizeRec", description: "Regular fit description" },
  { key: "sizeRec.fit.oversized.title", value: "Oversized Fit", section: "sizeRec", description: "Oversized fit title" },
  { key: "sizeRec.fit.oversized.desc", value: "Relaxed, roomy fit", section: "sizeRec", description: "Oversized fit description" },
  { key: "sizeRec.calculating", value: "Calculating...", section: "sizeRec", description: "Calculating state" },
  { key: "sizeRec.calculate", value: "Calculate My Size", section: "sizeRec", description: "Calculate button" },
  { key: "sizeRec.recalculate", value: "Recalculate Size", section: "sizeRec", description: "Recalculate button" },
  { key: "sizeRec.useSize", value: "Use This Size", section: "sizeRec", description: "Use size button" },
  { key: "sizeRec.fullGuide", value: "Full Size Guide", section: "sizeRec", description: "Full guide subheading" },
  { key: "sizeRec.chest", value: "Chest: ", section: "sizeRec", description: "Chest measurement prefix" },
];

async function main() {
  console.log("🌱 Seeding final component content...");

  let added = 0;
  let updated = 0;

  for (const item of FINAL_CONTENT) {
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
  console.log(`   📊 Total: ${FINAL_CONTENT.length} items processed`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
