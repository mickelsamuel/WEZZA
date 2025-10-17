import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("🔍 Verifying database connection and data...\n");

  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected successfully\n");

    // Check collections
    const collections = await prisma.collection.findMany();
    console.log(`📦 Collections: ${collections.length} found`);
    collections.forEach((c) => console.log(`   - ${c.name} (${c.slug})`));
    console.log();

    // Check products
    const products = await prisma.product.findMany({
      include: {
        collection: {
          select: { name: true },
        },
      },
    });
    console.log(`🛍️  Products: ${products.length} found`);
    products.forEach((p) => {
      const price = (p.price / 100).toFixed(2);
      console.log(`   - ${p.title} | $${price} ${p.currency} | ${p.collection?.name} | ${p.featured ? "⭐ Featured" : ""}`);
    });
    console.log();

    // Check featured products
    const featuredProducts = await prisma.product.findMany({
      where: { featured: true },
    });
    console.log(`⭐ Featured Products: ${featuredProducts.length} found`);
    featuredProducts.forEach((p) => console.log(`   - ${p.title}`));
    console.log();

    // Check inventory
    const inventory = await prisma.productInventory.findMany();
    console.log(`📊 Inventory entries: ${inventory.length} found`);
    inventory.forEach((inv) => {
      const sizes = inv.sizeQuantities as Record<string, number>;
      const sizeStr = Object.entries(sizes)
        .map(([size, qty]) => `${size}:${qty}`)
        .join(", ");
      console.log(`   - ${inv.productSlug} → ${sizeStr}`);
    });

    console.log("\n✅ Database verification complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
