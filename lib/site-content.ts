import { prisma } from "@/lib/prisma";

// Default content fallbacks (used if database is empty or unavailable)
const DEFAULT_CONTENT: Record<string, string> = {
  // Navigation
  "nav.home": "Home",
  "nav.shop": "Shop",
  "nav.custom": "Custom Orders",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.signin": "Sign In",

  // Hero Section
  "hero.title": "BUILT TO LIVE IN",
  "hero.description": "Premium heavyweight cotton hoodies. Minimal design, maximum comfort. Streetwear that moves with you.",
  "hero.cta.shop": "Shop Hoodies",
  "hero.cta.custom": "Custom Orders",

  // Homepage Sections
  "home.recommendations.title": "Picked Just For You",
  "home.recommendations.description": "Based on your browsing and purchase history",
  "home.featured.title": "Featured Hoodies",
  "home.featured.description": "Our most popular styles",
  "home.featured.viewAll": "View All Products",
  "home.valueProps.title": "Made For Daily Wear",
  "home.valueProps.description": "Every detail matters when you're building something to last",
  "home.valueProps.cotton.title": "Premium Cotton",
  "home.valueProps.cotton.description": "350gsm heavyweight fabric that gets better with every wash",
  "home.valueProps.fits.title": "Bold Fits",
  "home.valueProps.fits.description": "Modern silhouettes designed for everyday confidence",
  "home.valueProps.looks.title": "Clean Looks",
  "home.valueProps.looks.description": "Minimalist designs that never go out of style",
  "home.instagram.title": "Follow @WEZZA",
  "home.instagram.description": "See how our community styles their hoodies",

  // About Page
  "about.pageTitle": "About WEZZA",
  "about.intro": "Built to live in. That's our philosophy at WEZZA.",
  "about.story.title": "Our Story",
  "about.story.content": "WEZZA was founded on the belief that everyday clothing should be exceptional. We saw a gap in the market for hoodies that combined premium quality with minimalist design—pieces you'd actually want to wear every day.",
  "about.materials.title": "Premium Materials",
  "about.materials.content": "Every WEZZA hoodie is crafted from 350gsm heavyweight cotton—the same grade used by luxury streetwear brands. This isn't your average hoodie material. It's substantial, durable, and gets softer with every wash while maintaining its shape.",
  "about.philosophy.title": "Design Philosophy",
  "about.philosophy.content": "We believe in minimalism without compromise. Clean lines, bold fits, and timeless colorways that never go out of style. No excessive branding, no unnecessary details— just pure, refined streetwear.",
  "about.sustainability.title": "Sustainability",
  "about.sustainability.content": "Quality over quantity. By creating hoodies built to last years instead of seasons, we're doing our part to reduce fast fashion waste. Every piece is made to withstand the test of time—both in durability and style.",
  "about.tagline": "Built to live in.",
  "about.taglineSubtext": "That's not just a tagline—it's a promise.",

  // Contact Page
  "contact.pageTitle": "Contact & FAQ",
  "contact.email.title": "Email Us",
  "contact.email.description": "For general inquiries and support",
  "contact.email.address": "wezza28711@gmail.com",
  "contact.custom.title": "Custom Orders",
  "contact.custom.description": "Questions about custom designs?",
  "contact.custom.email": "wezza28711@gmail.com",
  "contact.faq.title": "Frequently Asked Questions",
  "contact.faq.shipping.question": "What are your shipping times?",
  "contact.faq.shipping.answer": "Standard orders ship within 1-2 business days and arrive in 5-7 business days. Custom orders take 2-3 weeks to produce, plus shipping time. We offer free shipping on all orders over $100 CAD.",
  "contact.faq.returns.question": "What is your return policy?",
  "contact.faq.returns.answer": "We accept returns within 30 days of delivery for unworn, unwashed items with original tags attached. Custom orders are final sale and cannot be returned. Please email us to initiate a return.",
  "contact.faq.fit.question": "How do your hoodies fit?",
  "contact.faq.fit.answer": "Our hoodies have a modern, slightly relaxed fit. They're true to size with room for comfortable layering. Check our size guide on each product page for detailed measurements. If you prefer an oversized look, we recommend sizing up.",
  "contact.faq.care.question": "How should I care for my WEZZA hoodie?",
  "contact.faq.care.answer": "Machine wash cold with like colors, tumble dry low. Do not bleach. Our premium heavyweight cotton is built to last—it will actually get softer and more comfortable with each wash while maintaining its shape.",
  "contact.faq.international.question": "Do you ship internationally?",
  "contact.faq.international.answer": "Currently we ship to Canada and the United States. We're working on expanding our shipping to international destinations. Sign up for our newsletter to be notified when we expand to your region.",
  "contact.faq.customOrder.question": "How does custom ordering work?",
  "contact.faq.customOrder.answer": "Fill out our custom order form with your design details. We'll review your request and email you within 24 hours with pricing, mockups, and timeline. Once approved, production takes 2-3 weeks. Minimum order is 1 piece.",
  "contact.stillQuestions.title": "Still have questions?",
  "contact.stillQuestions.description": "We're here to help. Email us at wezza28711@gmail.com and we'll get back to you within 24 hours.",

  // Custom Orders Page
  "custom.pageTitle": "Custom Orders",
  "custom.pageDescription": "Create your perfect hoodie. Starting at $89.99 CAD",
  "custom.form.name": "Full Name *",
  "custom.form.email": "Email *",
  "custom.form.color": "Hoodie Color *",
  "custom.form.colorPlaceholder": "Select a color",
  "custom.form.size": "Size *",
  "custom.form.sizePlaceholder": "Select a size",
  "custom.form.designNotes": "Design Notes *",
  "custom.form.designNotesPlaceholder": "Describe your design idea in detail. Include placement, colors, text, graphics, etc.",
  "custom.form.imageLabel": "Design Image (Optional)",
  "custom.form.imageDescription": "Upload a design mockup, sketch, or reference image",
  "custom.form.imageUrl": "Or Paste Image URL (Optional)",
  "custom.form.imageUrlPlaceholder": "https://example.com/your-design.jpg",
  "custom.form.imageUrlHelp": "Already have your design hosted online? Paste the link here.",
  "custom.form.submit": "Submit Custom Order",
  "custom.form.submitting": "Submitting...",
  "custom.form.bottomNote": "We'll review your request and email you within 24 hours with pricing and timeline.",
  "custom.success.title": "Order Submitted!",
  "custom.success.message": "Thank you for your custom order request.",
  "custom.success.followup": "We'll review your design notes and get back to you within 24 hours.",
  "custom.success.submitAnother": "Submit Another",
  "custom.success.continueShopping": "Continue Shopping",

  // Shop Page
  "shop.pageTitle": "Shop All Hoodies",
  "shop.productsAvailable": "products available",
  "shop.productAvailable": "product available",
  "shop.filters.title": "Filters",
  "shop.loading": "Loading products...",

  // Cart Page
  "cart.empty.title": "Your cart is empty",
  "cart.empty.description": "Add some hoodies to get started",
  "cart.empty.cta": "Shop Now",
  "cart.pageTitle": "Shopping Cart",
  "cart.summary.title": "Order Summary",
  "cart.summary.subtotal": "Subtotal",
  "cart.summary.shipping": "Shipping",
  "cart.summary.shippingFree": "FREE",
  "cart.summary.shippingCalculated": "Calculated at checkout",
  "cart.summary.total": "Total",
  "cart.summary.freeShippingProgress": "more for free shipping",
  "cart.checkout.button": "Proceed to Checkout",
  "cart.checkout.processing": "Processing...",
  "cart.checkout.secure": "Secure checkout powered by Stripe",

  // Checkout Success
  "checkoutSuccess.title": "Order Confirmed!",
  "checkoutSuccess.message": "Thank you for your purchase. We've sent a confirmation email with your order details.",
  "checkoutSuccess.shipping": "Your WEZZA hoodies will be shipped within 1-2 business days.",
  "checkoutSuccess.continueShopping": "Continue Shopping",
  "checkoutSuccess.backHome": "Back to Home",

  // Checkout Cancel
  "checkoutCancel.title": "Checkout Cancelled",
  "checkoutCancel.message": "Your order was not completed. Your cart has been saved.",
  "checkoutCancel.tryAgain": "Try Again",
  "checkoutCancel.backToCart": "Back to Cart",

  // Footer
  "footer.brandName": "WEZZA",
  "footer.brandTagline": "Built to live in. Premium streetwear hoodies crafted for comfort and style.",
  "footer.shop.title": "Shop",
  "footer.shop.allProducts": "All Products",
  "footer.shop.core": "Core Collection",
  "footer.shop.lunar": "Lunar Collection",
  "footer.shop.custom": "Custom Orders",
  "footer.support.title": "Support",
  "footer.support.contact": "Contact Us",
  "footer.support.faq": "FAQ",
  "footer.support.shipping": "Shipping",
  "footer.support.returns": "Returns",
  "footer.social.title": "Follow Us",
  "footer.copyright": "WEZZA. All rights reserved.",

  // User Dropdown
  "user.greeting": "Hey",
  "user.myAccount": "My Account",
  "user.myWishlist": "My Wishlist",
  "user.orderHistory": "Order History",
  "user.signOut": "Sign Out",
};

/**
 * Get site content by key with fallback to defaults
 * For use in server components
 */
export async function getContent(key: string): Promise<string> {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key },
    });

    return content?.value || DEFAULT_CONTENT[key] || key;
  } catch (error) {
    console.error(`Error fetching content for key "${key}":`, error);
    return DEFAULT_CONTENT[key] || key;
  }
}

/**
 * Get multiple site content items by keys
 * For use in server components
 */
export async function getContentMultiple(keys: string[]): Promise<Record<string, string>> {
  try {
    const content = await prisma.siteContent.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    const result: Record<string, string> = {};
    keys.forEach((key) => {
      const found = content.find((c) => c.key === key);
      result[key] = found?.value || DEFAULT_CONTENT[key] || key;
    });

    return result;
  } catch (error) {
    console.error("Error fetching multiple content items:", error);
    const result: Record<string, string> = {};
    keys.forEach((key) => {
      result[key] = DEFAULT_CONTENT[key] || key;
    });
    return result;
  }
}

/**
 * Get all content for a section with fallback to defaults
 * For use in server components
 */
export async function getContentBySection(section: string): Promise<Record<string, string>> {
  try {
    const content = await prisma.siteContent.findMany({
      where: { section },
    });

    const result: Record<string, string> = {};
    content.forEach((item) => {
      result[item.key] = item.value;
    });

    // Add defaults for any missing keys in this section
    Object.keys(DEFAULT_CONTENT).forEach((key) => {
      if (key.startsWith(`${section}.`) && !result[key]) {
        result[key] = DEFAULT_CONTENT[key];
      }
    });

    return result;
  } catch (error) {
    console.error(`Error fetching content for section "${section}":`, error);
    const result: Record<string, string> = {};
    Object.keys(DEFAULT_CONTENT).forEach((key) => {
      if (key.startsWith(`${section}.`)) {
        result[key] = DEFAULT_CONTENT[key];
      }
    });
    return result;
  }
}

/**
 * Get default content (for seeding or reference)
 */
export function getDefaultContent(): Record<string, string> {
  return DEFAULT_CONTENT;
}
