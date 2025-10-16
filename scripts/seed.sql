-- Seed script for WEZZA database
-- Run this in Supabase SQL Editor

-- Create Collections
INSERT INTO "Collection" (id, name, slug, description, featured, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Core', 'core', 'Timeless essentials for everyday wear', true, NOW(), NOW()),
  (gen_random_uuid(), 'Lunar', 'lunar', 'Limited edition moon-inspired designs', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create Products
INSERT INTO "Product" (id, slug, title, description, price, currency, "collectionId", images, sizes, colors, "inStock", featured, fabric, care, shipping, tags, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'classic-black-hoodie',
  'Classic Black Hoodie',
  'Our signature heavyweight hoodie in timeless black. Made with premium 350gsm cotton for ultimate comfort and durability.',
  8900,
  'CAD',
  c.id,
  '["/placeholder-product.jpg"]'::jsonb,
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black"]'::jsonb,
  true,
  true,
  '350gsm heavyweight cotton fleece with brushed interior',
  'Machine wash cold, tumble dry low. Do not bleach.',
  'Free shipping on orders over $100. Ships within 2-3 business days.',
  '["bestseller", "core"]'::jsonb,
  NOW(),
  NOW()
FROM "Collection" c WHERE c.slug = 'core'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, slug, title, description, price, currency, "collectionId", images, sizes, colors, "inStock", featured, fabric, care, shipping, tags, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'stone-grey-hoodie',
  'Stone Grey Hoodie',
  'Versatile stone grey that pairs with everything. Same premium quality as our classic black.',
  8900,
  'CAD',
  c.id,
  '["/placeholder-product.jpg"]'::jsonb,
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Grey"]'::jsonb,
  true,
  true,
  '350gsm heavyweight cotton fleece with brushed interior',
  'Machine wash cold, tumble dry low. Do not bleach.',
  'Free shipping on orders over $100. Ships within 2-3 business days.',
  '["bestseller", "core"]'::jsonb,
  NOW(),
  NOW()
FROM "Collection" c WHERE c.slug = 'core'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, slug, title, description, price, currency, "collectionId", images, sizes, colors, "inStock", featured, fabric, care, shipping, tags, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'navy-blue-hoodie',
  'Navy Blue Hoodie',
  'Deep navy blue for a refined look. Perfect for casual or smart-casual occasions.',
  8900,
  'CAD',
  c.id,
  '["/placeholder-product.jpg"]'::jsonb,
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Navy"]'::jsonb,
  true,
  true,
  '350gsm heavyweight cotton fleece with brushed interior',
  'Machine wash cold, tumble dry low. Do not bleach.',
  'Free shipping on orders over $100. Ships within 2-3 business days.',
  '["core"]'::jsonb,
  NOW(),
  NOW()
FROM "Collection" c WHERE c.slug = 'core'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, slug, title, description, price, currency, "collectionId", images, sizes, colors, "inStock", featured, fabric, care, shipping, tags, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'lunar-phase-hoodie',
  'Lunar Phase Hoodie',
  'Limited edition design featuring embroidered moon phases. Only 100 pieces available.',
  11900,
  'CAD',
  c.id,
  '["/placeholder-product.jpg"]'::jsonb,
  '["S", "M", "L", "XL"]'::jsonb,
  '["Black", "Navy"]'::jsonb,
  true,
  true,
  '350gsm heavyweight cotton fleece with custom embroidery',
  'Machine wash cold inside out, tumble dry low. Do not iron directly on embroidery.',
  'Free shipping on orders over $100. Ships within 2-3 business days.',
  '["limited", "new"]'::jsonb,
  NOW(),
  NOW()
FROM "Collection" c WHERE c.slug = 'lunar'
ON CONFLICT (slug) DO NOTHING;

-- Create Admin User
-- Password hash for: Mic13245
INSERT INTO "User" (id, name, email, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Mickel Samuel',
  'mickelsamuel.b@gmail.com',
  '$2b$10$QAj.uLME/GS9B1f9iExqluS0wQVGXWeRY7v2amCFCsZGsz5fr.BmC',
  'admin',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';
