import { PrismaClient } from "@prisma/client";
import productsData from "../data/products.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // First, ensure collections exist
  console.log("Creating collections...");
  const coreCollection = await prisma.collection.upsert({
    where: { slug: "core" },
    update: {
      name: "Core",
      description: "Essential hoodies built for everyday wear. Classic fits and timeless colors.",
      featured: true,
    },
    create: {
      slug: "core",
      name: "Core",
      description: "Essential hoodies built for everyday wear. Classic fits and timeless colors.",
      featured: true,
    },
  });

  const lunarCollection = await prisma.collection.upsert({
    where: { slug: "lunar" },
    update: {
      name: "Lunar",
      description: "Our signature collection featuring minimalist moon phase prints.",
      featured: true,
    },
    create: {
      slug: "lunar",
      name: "Lunar",
      description: "Our signature collection featuring minimalist moon phase prints.",
      featured: true,
    },
  });

  const customCollection = await prisma.collection.upsert({
    where: { slug: "customizable" },
    update: {
      name: "Customizable",
      description: "Premium blank hoodies ready for your custom designs.",
      featured: false,
    },
    create: {
      slug: "customizable",
      name: "Customizable",
      description: "Premium blank hoodies ready for your custom designs.",
      featured: false,
    },
  });

  console.log("✅ Collections created");

  // Map collection names to IDs
  const collectionMap: Record<string, string> = {
    Core: coreCollection.id,
    Lunar: lunarCollection.id,
    Customizable: customCollection.id,
  };

  // Seed products
  console.log("Seeding products...");
  let createdCount = 0;
  let updatedCount = 0;

  for (const product of productsData) {
    const collectionId = collectionMap[product.collection];

    if (!collectionId) {
      console.warn(`⚠️  Collection "${product.collection}" not found for product "${product.slug}"`);
      continue;
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (existingProduct) {
      // Update existing product
      await prisma.product.update({
        where: { slug: product.slug },
        data: {
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          collectionId: collectionId,
          inStock: product.inStock,
          featured: product.featured,
          tags: product.tags,
          fabric: product.fabric,
          care: product.care,
          shipping: product.shipping,
        },
      });
      updatedCount++;
    } else {
      // Create new product
      await prisma.product.create({
        data: {
          slug: product.slug,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          collectionId: collectionId,
          inStock: product.inStock,
          featured: product.featured,
          tags: product.tags,
          fabric: product.fabric,
          care: product.care,
          shipping: product.shipping,
        },
      });
      createdCount++;

      // Create inventory entry with size quantities as JSON
      const sizeQuantities: Record<string, number> = {};
      for (const size of product.sizes) {
        sizeQuantities[size] = 50; // Default stock of 50 per size
      }

      await prisma.productInventory.create({
        data: {
          productSlug: product.slug,
          sizeQuantities: sizeQuantities,
          lowStockThreshold: 5,
        },
      });
    }
  }

  console.log(`✅ Products processed: ${createdCount} created, ${updatedCount} updated`);
  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
