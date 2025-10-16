/**
 * Migration script to move products from JSON file to database
 * Run with: npx tsx scripts/migrate-products-to-db.ts
 */

import { prisma } from "@/lib/prisma";
import productsData from "@/data/products.json";

async function migrateProducts() {
  console.log("🚀 Starting product migration from JSON to database...\n");

  try {
    // First, create collections
    console.log("📦 Creating collections...");
    const collections = Array.from(new Set(productsData.map((p) => p.collection)));

    const collectionMap: Record<string, string> = {};

    for (const collectionName of collections) {
      const collection = await prisma.collection.upsert({
        where: { slug: collectionName.toLowerCase() },
        update: {},
        create: {
          slug: collectionName.toLowerCase(),
          name: collectionName,
          description: `${collectionName} collection hoodies`,
          featured: collectionName === "Core",
          sortOrder: collectionName === "Core" ? 0 : collectionName === "Lunar" ? 1 : 2,
        },
      });
      collectionMap[collectionName] = collection.id;
      console.log(`  ✓ ${collectionName} (${collection.id})`);
    }

    // Then create products
    console.log("\n👕 Creating products...");
    for (const product of productsData) {
      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          collectionId: collectionMap[product.collection],
          inStock: product.inStock,
          featured: product.featured,
          images: product.images,
          fabric: product.fabric,
          care: product.care,
          shipping: product.shipping,
          sizes: product.sizes,
          colors: product.colors,
          tags: product.tags || [],
        },
        create: {
          slug: product.slug,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          collectionId: collectionMap[product.collection],
          inStock: product.inStock,
          featured: product.featured,
          images: product.images,
          fabric: product.fabric,
          care: product.care,
          shipping: product.shipping,
          sizes: product.sizes,
          colors: product.colors,
          tags: product.tags || [],
        },
      });
      console.log(`  ✓ ${product.title} (${createdProduct.slug})`);

      // Create inventory records if they don't exist
      const existingInventory = await prisma.productInventory.findUnique({
        where: { productSlug: product.slug },
      });

      if (!existingInventory) {
        // Create default inventory: 10 items per size
        const sizeQuantities: Record<string, number> = {};
        for (const size of product.sizes) {
          sizeQuantities[size] = 10;
        }

        await prisma.productInventory.create({
          data: {
            productSlug: product.slug,
            sizeQuantities,
            lowStockThreshold: 5,
          },
        });
        console.log(`    → Created inventory for ${product.slug}`);
      }
    }

    // Stats
    const productCount = await prisma.product.count();
    const collectionCount = await prisma.collection.count();
    const inventoryCount = await prisma.productInventory.count();

    console.log("\n✅ Migration completed successfully!");
    console.log(`\n📊 Final stats:`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Collections: ${collectionCount}`);
    console.log(`   Inventory records: ${inventoryCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProducts();
