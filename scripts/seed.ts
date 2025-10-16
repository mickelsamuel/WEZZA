import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create Core Collection
  const coreCollection = await prisma.collection.upsert({
    where: { slug: "core" },
    update: {},
    create: {
      name: "Core",
      slug: "core",
      description: "Timeless essentials for everyday wear",
      featured: true,
    },
  });

  console.log("✓ Created Core collection");

  // Create Lunar Collection
  const lunarCollection = await prisma.collection.upsert({
    where: { slug: "lunar" },
    update: {},
    create: {
      name: "Lunar",
      slug: "lunar",
      description: "Limited edition moon-inspired designs",
      featured: true,
    },
  });

  console.log("✓ Created Lunar collection");

  // Create Products
  const products = [
    {
      slug: "classic-black-hoodie",
      title: "Classic Black Hoodie",
      description: "Our signature heavyweight hoodie in timeless black. Made with premium 350gsm cotton for ultimate comfort and durability.",
      price: 8900, // $89.00 in cents
      currency: "CAD",
      collectionId: coreCollection.id,
      images: ["/placeholder-product.jpg"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black"],
      inStock: true,
      featured: true,
      fabric: "350gsm heavyweight cotton fleece with brushed interior",
      care: "Machine wash cold, tumble dry low. Do not bleach.",
      shipping: "Free shipping on orders over $100. Ships within 2-3 business days.",
      tags: ["bestseller", "core"],
    },
    {
      slug: "stone-grey-hoodie",
      title: "Stone Grey Hoodie",
      description: "Versatile stone grey that pairs with everything. Same premium quality as our classic black.",
      price: 8900,
      currency: "CAD",
      collectionId: coreCollection.id,
      images: ["/placeholder-product.jpg"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Grey"],
      inStock: true,
      featured: true,
      fabric: "350gsm heavyweight cotton fleece with brushed interior",
      care: "Machine wash cold, tumble dry low. Do not bleach.",
      shipping: "Free shipping on orders over $100. Ships within 2-3 business days.",
      tags: ["bestseller", "core"],
    },
    {
      slug: "navy-blue-hoodie",
      title: "Navy Blue Hoodie",
      description: "Deep navy blue for a refined look. Perfect for casual or smart-casual occasions.",
      price: 8900,
      currency: "CAD",
      collectionId: coreCollection.id,
      images: ["/placeholder-product.jpg"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Navy"],
      inStock: true,
      featured: true,
      fabric: "350gsm heavyweight cotton fleece with brushed interior",
      care: "Machine wash cold, tumble dry low. Do not bleach.",
      shipping: "Free shipping on orders over $100. Ships within 2-3 business days.",
      tags: ["core"],
    },
    {
      slug: "lunar-phase-hoodie",
      title: "Lunar Phase Hoodie",
      description: "Limited edition design featuring embroidered moon phases. Only 100 pieces available.",
      price: 11900,
      currency: "CAD",
      collectionId: lunarCollection.id,
      images: ["/placeholder-product.jpg"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy"],
      inStock: true,
      featured: true,
      fabric: "350gsm heavyweight cotton fleece with custom embroidery",
      care: "Machine wash cold inside out, tumble dry low. Do not iron directly on embroidery.",
      shipping: "Free shipping on orders over $100. Ships within 2-3 business days.",
      tags: ["limited", "new"],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    console.log(`✓ Created product: ${product.title}`);
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@wezza.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@wezza.com",
      password: hashedPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log("✓ Created admin user (email: admin@wezza.com, password: admin123)");

  console.log("\n✅ Database seeded successfully!");
  console.log("\nYou can now:");
  console.log("1. Login as admin: admin@wezza.com / admin123");
  console.log("2. View products on the homepage");
  console.log("3. Add more products via the admin panel");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
