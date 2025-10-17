import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🗑️  Starting database cleanup...\n");

  try {
    // Delete in order to respect foreign key constraints
    console.log("Deleting data (keeping Users)...");

    // Delete user-related data
    await prisma.returnRequest.deleteMany({});
    console.log("  ✓ Deleted ReturnRequests");

    await prisma.stockNotification.deleteMany({});
    console.log("  ✓ Deleted StockNotifications");

    await prisma.savedPaymentMethod.deleteMany({});
    console.log("  ✓ Deleted SavedPaymentMethods");

    await prisma.userSizingProfile.deleteMany({});
    console.log("  ✓ Deleted UserSizingProfiles");

    await prisma.address.deleteMany({});
    console.log("  ✓ Deleted Addresses");

    await prisma.wishlist.deleteMany({});
    console.log("  ✓ Deleted Wishlists");

    await prisma.cart.deleteMany({});
    console.log("  ✓ Deleted Carts");

    await prisma.review.deleteMany({});
    console.log("  ✓ Deleted Reviews");

    // Delete orders
    await prisma.order.deleteMany({});
    console.log("  ✓ Deleted Orders");

    // Delete products and inventory
    await prisma.productInventory.deleteMany({});
    console.log("  ✓ Deleted ProductInventory");

    await prisma.product.deleteMany({});
    console.log("  ✓ Deleted Products");

    await prisma.collection.deleteMany({});
    console.log("  ✓ Deleted Collections");

    // Delete email/marketing data
    await prisma.emailLog.deleteMany({});
    console.log("  ✓ Deleted EmailLogs");

    await prisma.emailCampaign.deleteMany({});
    console.log("  ✓ Deleted EmailCampaigns");

    await prisma.emailSubscription.deleteMany({});
    console.log("  ✓ Deleted EmailSubscriptions");

    await prisma.cartAbandonment.deleteMany({});
    console.log("  ✓ Deleted CartAbandonments");

    await prisma.searchHistory.deleteMany({});
    console.log("  ✓ Deleted SearchHistory");

    // Delete site images
    await prisma.siteImage.deleteMany({});
    console.log("  ✓ Deleted SiteImages");

    // Show remaining users
    console.log("\n📊 Database Status:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`\n✅ Users remaining: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name || "No name"} (${user.email}) - ${user.role}`);
    });

    console.log("\n✅ Database cleared successfully!");
    console.log("   All data deleted except Users and Auth tables.");
  } catch (error) {
    console.error("\n❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
