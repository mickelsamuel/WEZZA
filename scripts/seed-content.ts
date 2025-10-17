import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Content organized by section with descriptions
const CONTENT_DATA = [
  // Navigation
  { key: "nav.home", value: "Home", section: "navigation", description: "Home navigation link text" },
  { key: "nav.shop", value: "Shop", section: "navigation", description: "Shop navigation link text" },
  { key: "nav.custom", value: "Custom Orders", section: "navigation", description: "Custom Orders navigation link text" },
  { key: "nav.about", value: "About", section: "navigation", description: "About navigation link text" },
  { key: "nav.contact", value: "Contact", section: "navigation", description: "Contact navigation link text" },
  { key: "nav.signin", value: "Sign In", section: "navigation", description: "Sign In button text" },

  // Hero Section
  { key: "hero.title", value: "BUILT TO LIVE IN", section: "hero", description: "Main hero headline" },
  { key: "hero.description", value: "Premium heavyweight cotton hoodies. Minimal design, maximum comfort. Streetwear that moves with you.", section: "hero", description: "Hero description text" },
  { key: "hero.cta.shop", value: "Shop Hoodies", section: "hero", description: "Shop button text" },
  { key: "hero.cta.custom", value: "Custom Orders", section: "hero", description: "Custom orders button text" },

  // Homepage - Recommendations
  { key: "home.recommendations.title", value: "Picked Just For You", section: "home", description: "Personalized recommendations section title" },
  { key: "home.recommendations.description", value: "Based on your browsing and purchase history", section: "home", description: "Recommendations description" },

  // Homepage - Featured Products
  { key: "home.featured.title", value: "Featured Hoodies", section: "home", description: "Featured products section title" },
  { key: "home.featured.description", value: "Our most popular styles", section: "home", description: "Featured products description" },
  { key: "home.featured.viewAll", value: "View All Products", section: "home", description: "View all button text" },

  // Homepage - Value Props
  { key: "home.valueProps.title", value: "Made For Daily Wear", section: "home", description: "Value propositions section title" },
  { key: "home.valueProps.description", value: "Every detail matters when you're building something to last", section: "home", description: "Value props description" },
  { key: "home.valueProps.cotton.title", value: "Premium Cotton", section: "home", description: "Cotton value prop title" },
  { key: "home.valueProps.cotton.description", value: "350gsm heavyweight fabric that gets better with every wash", section: "home", description: "Cotton value prop description" },
  { key: "home.valueProps.fits.title", value: "Bold Fits", section: "home", description: "Fits value prop title" },
  { key: "home.valueProps.fits.description", value: "Modern silhouettes designed for everyday confidence", section: "home", description: "Fits value prop description" },
  { key: "home.valueProps.looks.title", value: "Clean Looks", section: "home", description: "Looks value prop title" },
  { key: "home.valueProps.looks.description", value: "Minimalist designs that never go out of style", section: "home", description: "Looks value prop description" },

  // Homepage - Instagram
  { key: "home.instagram.title", value: "Follow @WEZZA", section: "home", description: "Instagram section title" },
  { key: "home.instagram.description", value: "See how our community styles their hoodies", section: "home", description: "Instagram section description" },

  // About Page
  { key: "about.pageTitle", value: "About WEZZA", section: "about", description: "About page title" },
  { key: "about.intro", value: "Built to live in. That's our philosophy at WEZZA.", section: "about", description: "About page intro text" },
  { key: "about.story.title", value: "Our Story", section: "about", description: "Our Story section title" },
  { key: "about.story.content", value: "WEZZA was founded on the belief that everyday clothing should be exceptional. We saw a gap in the market for hoodies that combined premium quality with minimalist design—pieces you'd actually want to wear every day.", section: "about", description: "Our Story content" },
  { key: "about.materials.title", value: "Premium Materials", section: "about", description: "Materials section title" },
  { key: "about.materials.content", value: "Every WEZZA hoodie is crafted from 350gsm heavyweight cotton—the same grade used by luxury streetwear brands. This isn't your average hoodie material. It's substantial, durable, and gets softer with every wash while maintaining its shape.", section: "about", description: "Materials content" },
  { key: "about.philosophy.title", value: "Design Philosophy", section: "about", description: "Philosophy section title" },
  { key: "about.philosophy.content", value: "We believe in minimalism without compromise. Clean lines, bold fits, and timeless colorways that never go out of style. No excessive branding, no unnecessary details— just pure, refined streetwear.", section: "about", description: "Philosophy content" },
  { key: "about.sustainability.title", value: "Sustainability", section: "about", description: "Sustainability section title" },
  { key: "about.sustainability.content", value: "Quality over quantity. By creating hoodies built to last years instead of seasons, we're doing our part to reduce fast fashion waste. Every piece is made to withstand the test of time—both in durability and style.", section: "about", description: "Sustainability content" },
  { key: "about.tagline", value: "Built to live in.", section: "about", description: "About page tagline" },
  { key: "about.taglineSubtext", value: "That's not just a tagline—it's a promise.", section: "about", description: "Tagline subtext" },

  // Contact Page
  { key: "contact.pageTitle", value: "Contact & FAQ", section: "contact", description: "Contact page title" },
  { key: "contact.email.title", value: "Email Us", section: "contact", description: "Email card title" },
  { key: "contact.email.description", value: "For general inquiries and support", section: "contact", description: "Email card description" },
  { key: "contact.email.address", value: "wezza28711@gmail.com", section: "contact", description: "General contact email" },
  { key: "contact.custom.title", value: "Custom Orders", section: "contact", description: "Custom orders card title" },
  { key: "contact.custom.description", value: "Questions about custom designs?", section: "contact", description: "Custom orders card description" },
  { key: "contact.custom.email", value: "wezza28711@gmail.com", section: "contact", description: "Custom orders email" },
  { key: "contact.faq.title", value: "Frequently Asked Questions", section: "contact", description: "FAQ section title" },

  // FAQ Items
  { key: "contact.faq.shipping.question", value: "What are your shipping times?", section: "contact", description: "Shipping FAQ question" },
  { key: "contact.faq.shipping.answer", value: "Standard orders ship within 1-2 business days and arrive in 5-7 business days. Custom orders take 2-3 weeks to produce, plus shipping time. We offer free shipping on all orders over $100 CAD.", section: "contact", description: "Shipping FAQ answer" },
  { key: "contact.faq.returns.question", value: "What is your return policy?", section: "contact", description: "Returns FAQ question" },
  { key: "contact.faq.returns.answer", value: "We accept returns within 30 days of delivery for unworn, unwashed items with original tags attached. Custom orders are final sale and cannot be returned. Please email us to initiate a return.", section: "contact", description: "Returns FAQ answer" },
  { key: "contact.faq.fit.question", value: "How do your hoodies fit?", section: "contact", description: "Fit FAQ question" },
  { key: "contact.faq.fit.answer", value: "Our hoodies have a modern, slightly relaxed fit. They're true to size with room for comfortable layering. Check our size guide on each product page for detailed measurements. If you prefer an oversized look, we recommend sizing up.", section: "contact", description: "Fit FAQ answer" },
  { key: "contact.faq.care.question", value: "How should I care for my WEZZA hoodie?", section: "contact", description: "Care FAQ question" },
  { key: "contact.faq.care.answer", value: "Machine wash cold with like colors, tumble dry low. Do not bleach. Our premium heavyweight cotton is built to last—it will actually get softer and more comfortable with each wash while maintaining its shape.", section: "contact", description: "Care FAQ answer" },
  { key: "contact.faq.international.question", value: "Do you ship internationally?", section: "contact", description: "International shipping FAQ question" },
  { key: "contact.faq.international.answer", value: "Currently we ship to Canada and the United States. We're working on expanding our shipping to international destinations. Sign up for our newsletter to be notified when we expand to your region.", section: "contact", description: "International shipping FAQ answer" },
  { key: "contact.faq.customOrder.question", value: "How does custom ordering work?", section: "contact", description: "Custom order FAQ question" },
  { key: "contact.faq.customOrder.answer", value: "Fill out our custom order form with your design details. We'll review your request and email you within 24 hours with pricing, mockups, and timeline. Once approved, production takes 2-3 weeks. Minimum order is 1 piece.", section: "contact", description: "Custom order FAQ answer" },

  { key: "contact.stillQuestions.title", value: "Still have questions?", section: "contact", description: "Still questions section title" },
  { key: "contact.stillQuestions.description", value: "We're here to help. Email us at wezza28711@gmail.com and we'll get back to you within 24 hours.", section: "contact", description: "Still questions description" },

  // Custom Orders Page
  { key: "custom.pageTitle", value: "Custom Orders", section: "custom", description: "Custom orders page title" },
  { key: "custom.pageDescription", value: "Create your perfect hoodie. Starting at $89.99 CAD", section: "custom", description: "Custom orders page description" },
  { key: "custom.form.name", value: "Full Name *", section: "custom", description: "Name field label" },
  { key: "custom.form.email", value: "Email *", section: "custom", description: "Email field label" },
  { key: "custom.form.color", value: "Hoodie Color *", section: "custom", description: "Color field label" },
  { key: "custom.form.colorPlaceholder", value: "Select a color", section: "custom", description: "Color field placeholder" },
  { key: "custom.form.size", value: "Size *", section: "custom", description: "Size field label" },
  { key: "custom.form.sizePlaceholder", value: "Select a size", section: "custom", description: "Size field placeholder" },
  { key: "custom.form.designNotes", value: "Design Notes *", section: "custom", description: "Design notes field label" },
  { key: "custom.form.designNotesPlaceholder", value: "Describe your design idea in detail. Include placement, colors, text, graphics, etc.", section: "custom", description: "Design notes placeholder" },
  { key: "custom.form.imageLabel", value: "Design Image (Optional)", section: "custom", description: "Image upload label" },
  { key: "custom.form.imageDescription", value: "Upload a design mockup, sketch, or reference image", section: "custom", description: "Image upload description" },
  { key: "custom.form.imageUrl", value: "Or Paste Image URL (Optional)", section: "custom", description: "Image URL field label" },
  { key: "custom.form.imageUrlPlaceholder", value: "https://example.com/your-design.jpg", section: "custom", description: "Image URL placeholder" },
  { key: "custom.form.imageUrlHelp", value: "Already have your design hosted online? Paste the link here.", section: "custom", description: "Image URL help text" },
  { key: "custom.form.submit", value: "Submit Custom Order", section: "custom", description: "Submit button text" },
  { key: "custom.form.submitting", value: "Submitting...", section: "custom", description: "Submitting button text" },
  { key: "custom.form.bottomNote", value: "We'll review your request and email you within 24 hours with pricing and timeline.", section: "custom", description: "Form bottom note" },
  { key: "custom.success.title", value: "Order Submitted!", section: "custom", description: "Success page title" },
  { key: "custom.success.message", value: "Thank you for your custom order request.", section: "custom", description: "Success message" },
  { key: "custom.success.followup", value: "We'll review your design notes and get back to you within 24 hours.", section: "custom", description: "Success followup message" },
  { key: "custom.success.submitAnother", value: "Submit Another", section: "custom", description: "Submit another button" },
  { key: "custom.success.continueShopping", value: "Continue Shopping", section: "custom", description: "Continue shopping button" },

  // Shop Page
  { key: "shop.pageTitle", value: "Shop All Hoodies", section: "shop", description: "Shop page title" },
  { key: "shop.productsAvailable", value: "products available", section: "shop", description: "Products available text (plural)" },
  { key: "shop.productAvailable", value: "product available", section: "shop", description: "Product available text (singular)" },
  { key: "shop.filters.title", value: "Filters", section: "shop", description: "Filters sidebar title" },
  { key: "shop.loading", value: "Loading products...", section: "shop", description: "Loading state text" },

  // Cart Page
  { key: "cart.empty.title", value: "Your cart is empty", section: "cart", description: "Empty cart title" },
  { key: "cart.empty.description", value: "Add some hoodies to get started", section: "cart", description: "Empty cart description" },
  { key: "cart.empty.cta", value: "Shop Now", section: "cart", description: "Empty cart CTA button" },
  { key: "cart.pageTitle", value: "Shopping Cart", section: "cart", description: "Cart page title" },
  { key: "cart.summary.title", value: "Order Summary", section: "cart", description: "Order summary title" },
  { key: "cart.summary.subtotal", value: "Subtotal", section: "cart", description: "Subtotal label" },
  { key: "cart.summary.shipping", value: "Shipping", section: "cart", description: "Shipping label" },
  { key: "cart.summary.shippingFree", value: "FREE", section: "cart", description: "Free shipping text" },
  { key: "cart.summary.shippingCalculated", value: "Calculated at checkout", section: "cart", description: "Shipping calculated text" },
  { key: "cart.summary.total", value: "Total", section: "cart", description: "Total label" },
  { key: "cart.summary.freeShippingProgress", value: "more for free shipping", section: "cart", description: "Free shipping progress text" },
  { key: "cart.checkout.button", value: "Proceed to Checkout", section: "cart", description: "Checkout button text" },
  { key: "cart.checkout.processing", value: "Processing...", section: "cart", description: "Processing button text" },
  { key: "cart.checkout.secure", value: "Secure checkout powered by Stripe", section: "cart", description: "Secure checkout note" },

  // Checkout Success
  { key: "checkoutSuccess.title", value: "Order Confirmed!", section: "checkout", description: "Success page title" },
  { key: "checkoutSuccess.message", value: "Thank you for your purchase. We've sent a confirmation email with your order details.", section: "checkout", description: "Success message" },
  { key: "checkoutSuccess.shipping", value: "Your WEZZA hoodies will be shipped within 1-2 business days.", section: "checkout", description: "Shipping info" },
  { key: "checkoutSuccess.continueShopping", value: "Continue Shopping", section: "checkout", description: "Continue shopping button" },
  { key: "checkoutSuccess.backHome", value: "Back to Home", section: "checkout", description: "Back home button" },

  // Checkout Cancel
  { key: "checkoutCancel.title", value: "Checkout Cancelled", section: "checkout", description: "Cancel page title" },
  { key: "checkoutCancel.message", value: "Your order was not completed. Your cart has been saved.", section: "checkout", description: "Cancel message" },
  { key: "checkoutCancel.tryAgain", value: "Try Again", section: "checkout", description: "Try again button" },
  { key: "checkoutCancel.backToCart", value: "Back to Cart", section: "checkout", description: "Back to cart button" },

  // Footer
  { key: "footer.brandName", value: "WEZZA", section: "footer", description: "Brand name in footer" },
  { key: "footer.brandTagline", value: "Built to live in. Premium streetwear hoodies crafted for comfort and style.", section: "footer", description: "Brand tagline in footer" },
  { key: "footer.shop.title", value: "Shop", section: "footer", description: "Shop section title" },
  { key: "footer.shop.allProducts", value: "All Products", section: "footer", description: "All products link" },
  { key: "footer.shop.core", value: "Core Collection", section: "footer", description: "Core collection link" },
  { key: "footer.shop.lunar", value: "Lunar Collection", section: "footer", description: "Lunar collection link" },
  { key: "footer.shop.custom", value: "Custom Orders", section: "footer", description: "Custom orders link" },
  { key: "footer.support.title", value: "Support", section: "footer", description: "Support section title" },
  { key: "footer.support.contact", value: "Contact Us", section: "footer", description: "Contact us link" },
  { key: "footer.support.faq", value: "FAQ", section: "footer", description: "FAQ link" },
  { key: "footer.support.shipping", value: "Shipping", section: "footer", description: "Shipping link" },
  { key: "footer.support.returns", value: "Returns", section: "footer", description: "Returns link" },
  { key: "footer.social.title", value: "Follow Us", section: "footer", description: "Social media section title" },
  { key: "footer.copyright", value: "WEZZA. All rights reserved.", section: "footer", description: "Copyright text" },

  // User Dropdown
  { key: "user.greeting", value: "Hey", section: "user", description: "User greeting" },
  { key: "user.myAccount", value: "My Account", section: "user", description: "My Account link" },
  { key: "user.myWishlist", value: "My Wishlist", section: "user", description: "My Wishlist link" },
  { key: "user.orderHistory", value: "Order History", section: "user", description: "Order History link" },
  { key: "user.signOut", value: "Sign Out", section: "user", description: "Sign Out button" },
];

async function main() {
  console.log("🌱 Seeding site content...");

  let created = 0;
  let updated = 0;

  for (const item of CONTENT_DATA) {
    const existing = await prisma.siteContent.findUnique({
      where: { key: item.key },
    });

    if (existing) {
      // Update existing content
      await prisma.siteContent.update({
        where: { key: item.key },
        data: {
          value: item.value,
          section: item.section,
          description: item.description,
        },
      });
      updated++;
    } else {
      // Create new content
      await prisma.siteContent.create({
        data: item,
      });
      created++;
    }
  }

  console.log(`✅ Seeding complete!`);
  console.log(`   Created: ${created} items`);
  console.log(`   Updated: ${updated} items`);
  console.log(`   Total: ${CONTENT_DATA.length} items`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
