import { prisma } from "../lib/prisma";

// ALL remaining modal and component content
const MODAL_CONTENT = [
  // Auth Modal (~50 strings)
  { key: "auth.signIn.heading", value: "WELCOME BACK", section: "auth", description: "Sign in heading" },
  { key: "auth.signIn.description", value: "Sign in to access your account", section: "auth", description: "Sign in description" },
  { key: "auth.register.heading", value: "JOIN WEZZA", section: "auth", description: "Register heading" },
  { key: "auth.register.description", value: "Create your account and start shopping", section: "auth", description: "Register description" },
  { key: "auth.email.label", value: "Email Address", section: "auth", description: "Email label" },
  { key: "auth.email.placeholder", value: "you@example.com", section: "auth", description: "Email placeholder" },
  { key: "auth.password.label", value: "Password", section: "auth", description: "Password label" },
  { key: "auth.password.placeholder", value: "••••••••", section: "auth", description: "Password placeholder" },
  { key: "auth.password.help", value: "Must be at least 6 characters", section: "auth", description: "Password help text" },
  { key: "auth.confirmPassword.label", value: "Confirm Password", section: "auth", description: "Confirm password label" },
  { key: "auth.confirmPassword.placeholder", value: "••••••••", section: "auth", description: "Confirm password placeholder" },
  { key: "auth.fullName.label", value: "Full Name", section: "auth", description: "Full name label" },
  { key: "auth.fullName.placeholder", value: "John Doe", section: "auth", description: "Full name placeholder" },
  { key: "auth.signIn.button", value: "Sign In", section: "auth", description: "Sign in button" },
  { key: "auth.signIn.loading", value: "Signing in...", section: "auth", description: "Sign in loading" },
  { key: "auth.register.button", value: "Create Account", section: "auth", description: "Register button" },
  { key: "auth.register.loading", value: "Creating account...", section: "auth", description: "Register loading" },
  { key: "auth.or", value: "or", section: "auth", description: "Or divider" },
  { key: "auth.noAccount", value: "Don't have an account?", section: "auth", description: "No account prompt" },
  { key: "auth.haveAccount", value: "Already have an account?", section: "auth", description: "Have account prompt" },
  { key: "auth.switchToRegister", value: "Create Account", section: "auth", description: "Switch to register" },
  { key: "auth.switchToSignIn", value: "Sign In", section: "auth", description: "Switch to sign in" },
  { key: "auth.continueGuest", value: "Continue as guest", section: "auth", description: "Continue as guest" },
  { key: "auth.terms", value: "By continuing, you agree to our Terms of Service and Privacy Policy", section: "auth", description: "Terms text" },
  { key: "auth.error.title", value: "Error", section: "auth", description: "Error toast title" },
  { key: "auth.error.invalidCredentials", value: "Invalid email or password", section: "auth", description: "Invalid credentials" },
  { key: "auth.error.passwordMismatch", value: "Passwords do not match", section: "auth", description: "Password mismatch" },
  { key: "auth.error.passwordLength", value: "Password must be at least 6 characters", section: "auth", description: "Password length" },
  { key: "auth.error.generic", value: "Something went wrong", section: "auth", description: "Generic error" },
  { key: "auth.error.failedCreate", value: "Failed to create account", section: "auth", description: "Failed to create" },
  { key: "auth.success.title", value: "Success", section: "auth", description: "Success toast title" },
  { key: "auth.success.welcome", value: "Welcome back!", section: "auth", description: "Welcome back message" },
  { key: "auth.success.accountCreated", value: "Account created successfully!", section: "auth", description: "Account created" },
  { key: "auth.success.pleaseSignIn", value: "Please sign in with your new account", section: "auth", description: "Please sign in" },

  // Account Page (~40 strings)
  { key: "account.loading", value: "Loading...", section: "account", description: "Loading text" },
  { key: "account.backToStore", value: "Back to Store", section: "account", description: "Back to store link" },
  { key: "account.heading", value: "MY ACCOUNT", section: "account", description: "Page heading" },
  { key: "account.welcome", value: "Welcome back", section: "account", description: "Welcome greeting" },
  { key: "account.signOut", value: "Sign Out", section: "account", description: "Sign out button" },
  { key: "account.stats.orders", value: "Total Orders", section: "account", description: "Total orders stat" },
  { key: "account.stats.addresses", value: "Saved Addresses", section: "account", description: "Saved addresses stat" },
  { key: "account.stats.status", value: "Account Status", section: "account", description: "Account status label" },
  { key: "account.stats.active", value: "Active", section: "account", description: "Active status" },
  { key: "account.details.heading", value: "Account Details", section: "account", description: "Account details heading" },
  { key: "account.details.email", value: "Email", section: "account", description: "Email label" },
  { key: "account.details.name", value: "Name", section: "account", description: "Name label" },
  { key: "account.addresses.heading", value: "Saved Addresses", section: "account", description: "Addresses heading" },
  { key: "account.addresses.add", value: "Add Address", section: "account", description: "Add address button" },
  { key: "account.addresses.edit", value: "Edit Address", section: "account", description: "Edit address heading" },
  { key: "account.addresses.new", value: "New Address", section: "account", description: "New address heading" },
  { key: "account.addresses.name.label", value: "Address Name *", section: "account", description: "Address name label" },
  { key: "account.addresses.name.placeholder", value: "e.g., Home, Work", section: "account", description: "Address name placeholder" },
  { key: "account.addresses.street.label", value: "Street Address *", section: "account", description: "Street label" },
  { key: "account.addresses.street.placeholder", value: "123 Main St", section: "account", description: "Street placeholder" },
  { key: "account.addresses.city.label", value: "City *", section: "account", description: "City label" },
  { key: "account.addresses.city.placeholder", value: "Toronto", section: "account", description: "City placeholder" },
  { key: "account.addresses.province.label", value: "Province *", section: "account", description: "Province label" },
  { key: "account.addresses.province.placeholder", value: "ON", section: "account", description: "Province placeholder" },
  { key: "account.addresses.postal.label", value: "Postal Code *", section: "account", description: "Postal label" },
  { key: "account.addresses.postal.placeholder", value: "A1A 1A1", section: "account", description: "Postal placeholder" },
  { key: "account.addresses.country.label", value: "Country *", section: "account", description: "Country label" },
  { key: "account.addresses.default", value: "Set as default address", section: "account", description: "Default checkbox" },
  { key: "account.addresses.update", value: "Update Address", section: "account", description: "Update button" },
  { key: "account.addresses.save", value: "Save Address", section: "account", description: "Save button" },
  { key: "account.addresses.cancel", value: "Cancel", section: "account", description: "Cancel button" },
  { key: "account.addresses.empty", value: "No saved addresses yet", section: "account", description: "Empty state" },
  { key: "account.addresses.defaultBadge", value: "Default", section: "account", description: "Default badge" },
  { key: "account.addresses.editButton", value: "Edit", section: "account", description: "Edit button" },
  { key: "account.addresses.deleteButton", value: "Delete", section: "account", description: "Delete button" },
  { key: "account.addresses.deleteConfirm", value: "Are you sure you want to delete this address?", section: "account", description: "Delete confirmation" },
  { key: "account.addresses.updated", value: "Address updated!", section: "account", description: "Updated toast" },
  { key: "account.addresses.added", value: "Address added!", section: "account", description: "Added toast" },
  { key: "account.addresses.deleted", value: "Address deleted!", section: "account", description: "Deleted toast" },
  { key: "account.addresses.error", value: "Failed to save address", section: "account", description: "Error toast" },
  { key: "account.addresses.deleteError", value: "Failed to delete address", section: "account", description: "Delete error" },
  { key: "account.orders.heading", value: "Order History", section: "account", description: "Orders heading" },
  { key: "account.orders.loading", value: "Loading orders...", section: "account", description: "Loading orders" },
  { key: "account.orders.empty", value: "You haven't placed any orders yet", section: "account", description: "Empty orders" },
  { key: "account.orders.startShopping", value: "Start Shopping", section: "account", description: "Start shopping button" },
  { key: "account.orders.items", value: "items", section: "account", description: "Items text" },

  // Wishlist Page (~15 strings)
  { key: "wishlist.loading", value: "Loading...", section: "wishlist", description: "Loading text" },
  { key: "wishlist.backToStore", value: "Back to Store", section: "wishlist", description: "Back to store" },
  { key: "wishlist.heading", value: "MY WISHLIST", section: "wishlist", description: "Page heading" },
  { key: "wishlist.item", value: "item", section: "wishlist", description: "Item singular" },
  { key: "wishlist.items", value: "items", section: "wishlist", description: "Items plural" },
  { key: "wishlist.savedFor", value: "saved for later", section: "wishlist", description: "Saved for later text" },
  { key: "wishlist.empty.title", value: "Your wishlist is empty", section: "wishlist", description: "Empty title" },
  { key: "wishlist.empty.description", value: "Start adding items you love to your wishlist!", section: "wishlist", description: "Empty description" },
  { key: "wishlist.empty.button", value: "Browse Products", section: "wishlist", description: "Browse button" },
  { key: "wishlist.outOfStock", value: "OUT OF STOCK", section: "wishlist", description: "Out of stock badge" },
  { key: "wishlist.addToCart", value: "Add to Cart", section: "wishlist", description: "Add to cart button" },
  { key: "wishlist.toast.added", value: "Added to cart", section: "wishlist", description: "Added toast" },
  { key: "wishlist.toast.removed", value: "Removed from wishlist", section: "wishlist", description: "Removed toast" },
  { key: "wishlist.toast.outOfStock", value: "This item is currently out of stock", section: "wishlist", description: "Out of stock toast" },
  { key: "wishlist.toast.failed", value: "Failed to load wishlist", section: "wishlist", description: "Failed toast" },
  { key: "wishlist.toast.removeFailed", value: "Failed to remove item", section: "wishlist", description: "Remove failed toast" },

  // Wishlist Button (~6 strings)
  { key: "wishlistButton.add", value: "Add to Wishlist", section: "wishlistButton", description: "Add button text" },
  { key: "wishlistButton.remove", value: "Remove from Wishlist", section: "wishlistButton", description: "Remove button text" },
  { key: "wishlistButton.addTitle", value: "Add to wishlist", section: "wishlistButton", description: "Add title" },
  { key: "wishlistButton.removeTitle", value: "Remove from wishlist", section: "wishlistButton", description: "Remove title" },
  { key: "wishlistButton.toast.added.title", value: "Added to wishlist", section: "wishlistButton", description: "Added toast title" },
  { key: "wishlistButton.toast.added.description", value: "Product added to your wishlist", section: "wishlistButton", description: "Added toast description" },
  { key: "wishlistButton.toast.removed.title", value: "Removed from wishlist", section: "wishlistButton", description: "Removed toast title" },
  { key: "wishlistButton.toast.removed.description", value: "Product removed from your wishlist", section: "wishlistButton", description: "Removed toast description" },
  { key: "wishlistButton.toast.error.title", value: "Error", section: "wishlistButton", description: "Error toast title" },
  { key: "wishlistButton.toast.error.description", value: "Something went wrong", section: "wishlistButton", description: "Error toast description" },

  // Stock Indicator (~8 strings)
  { key: "stockIndicator.inStock", value: "In Stock", section: "stockIndicator", description: "In stock text" },
  { key: "stockIndicator.outOfStock", value: "Out of Stock", section: "stockIndicator", description: "Out of stock text" },
  { key: "stockIndicator.outOfStockIn", value: "Out of Stock in", section: "stockIndicator", description: "Out of stock in size" },
  { key: "stockIndicator.onlyLeft", value: "Only", section: "stockIndicator", description: "Only text" },
  { key: "stockIndicator.left", value: "left", section: "stockIndicator", description: "Left text" },
  { key: "stockIndicator.leftInSize", value: "left in", section: "stockIndicator", description: "Left in size" },
];

async function main() {
  console.log("🌱 Seeding modal and component content...");

  let added = 0;
  let updated = 0;

  for (const item of MODAL_CONTENT) {
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
  console.log(`   📊 Total: ${MODAL_CONTENT.length} items processed`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
