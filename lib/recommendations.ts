import { Product } from "./types";
import { getAllProducts } from "./products";
import { prisma } from "./prisma";

export interface RecommendationOptions {
  currentProductSlug?: string;
  userId?: string;
  limit?: number;
  collection?: string;
}

/**
 * Get product recommendations based on various factors
 */
export async function getRecommendations(
  options: RecommendationOptions = {}
): Promise<Product[]> {
  const { currentProductSlug, userId, limit = 4, collection } = options;
  const allProducts = getAllProducts();

  // Filter out current product
  let candidateProducts = allProducts.filter(
    (p) => p.slug !== currentProductSlug
  );

  // If collection is specified, prioritize same collection
  if (collection) {
    const sameCollection = candidateProducts.filter(
      (p) => p.collection === collection
    );
    const otherCollection = candidateProducts.filter(
      (p) => p.collection !== collection
    );
    candidateProducts = [...sameCollection, ...otherCollection];
  }

  // If user is logged in, add personalization
  if (userId) {
    try {
      const userBehavior = await getUserBehavior(userId);
      candidateProducts = scoreAndSortProducts(
        candidateProducts,
        userBehavior
      );
    } catch (error) {
      console.error("Error getting user behavior:", error);
    }
  }

  // Prioritize featured and bestsellers
  candidateProducts.sort((a, b) => {
    const aScore = getProductScore(a);
    const bScore = getProductScore(b);
    return bScore - aScore;
  });

  return candidateProducts.slice(0, limit);
}

/**
 * Get related products for a specific product
 */
export async function getRelatedProducts(
  productSlug: string,
  limit: number = 4
): Promise<Product[]> {
  const allProducts = getAllProducts();
  const currentProduct = allProducts.find((p) => p.slug === productSlug);

  if (!currentProduct) {
    return [];
  }

  // Score products by similarity
  const scoredProducts = allProducts
    .filter((p) => p.slug !== productSlug)
    .map((product) => ({
      product,
      score: calculateSimilarity(currentProduct, product),
    }))
    .sort((a, b) => b.score - a.score);

  return scoredProducts.slice(0, limit).map((item) => item.product);
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const userBehavior = await getUserBehavior(userId);
    const allProducts = getAllProducts();

    // Score products based on user behavior
    const scoredProducts = scoreAndSortProducts(allProducts, userBehavior);

    return scoredProducts.slice(0, limit);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    // Fallback to featured products
    return getAllProducts().filter((p) => p.featured).slice(0, limit);
  }
}

/**
 * Get user's browsing and purchase behavior
 */
async function getUserBehavior(userId: string) {
  const [orders, wishlist, reviews, searchHistory] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      select: { items: true },
    }),
    prisma.wishlist.findMany({
      where: { userId },
      select: { productSlug: true },
    }),
    prisma.review.findMany({
      where: { userId },
      select: { productSlug: true, rating: true },
    }),
    prisma.searchHistory.findMany({
      where: { userId },
      select: { query: true, clicked: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Extract purchased product slugs
  const purchasedSlugs = orders.flatMap((order: any) => {
    const items = order.items as any[];
    return items.map((item: any) => item.slug);
  });

  // Extract collections and colors from user behavior
  const allProducts = getAllProducts();
  const behaviorProducts = allProducts.filter(
    (p) =>
      purchasedSlugs.includes(p.slug) ||
      wishlist.some((w: any) => w.productSlug === p.slug)
  );

  const favoriteCollections = getMostCommon(
    behaviorProducts.map((p) => p.collection)
  );
  const favoriteColors = getMostCommon(
    behaviorProducts.flatMap((p) => p.colors)
  );

  return {
    purchasedSlugs,
    wishlistSlugs: wishlist.map((w: any) => w.productSlug),
    reviewedSlugs: reviews.map((r: any) => r.productSlug),
    searchedSlugs: searchHistory
      .filter((s: any) => s.clicked)
      .map((s: any) => s.clicked as string),
    favoriteCollections,
    favoriteColors,
  };
}

/**
 * Score and sort products based on user behavior
 */
function scoreAndSortProducts(
  products: Product[],
  behavior: Awaited<ReturnType<typeof getUserBehavior>>
): Product[] {
  return products
    .map((product) => {
      let score = 0;

      // Don't recommend already purchased items
      if (behavior.purchasedSlugs.includes(product.slug)) {
        return { product, score: -1000 };
      }

      // High score for wishlist items
      if (behavior.wishlistSlugs.includes(product.slug)) {
        score += 100;
      }

      // Score based on favorite collections
      if (behavior.favoriteCollections.includes(product.collection)) {
        score += 50;
      }

      // Score based on favorite colors
      if (product.colors.some((c) => behavior.favoriteColors.includes(c))) {
        score += 30;
      }

      // Score based on featured/bestseller status
      if (product.featured) score += 20;
      if (product.tags.includes("bestseller")) score += 15;
      if (product.tags.includes("new")) score += 10;

      return { product, score };
    })
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

/**
 * Calculate similarity between two products
 */
function calculateSimilarity(product1: Product, product2: Product): number {
  let score = 0;

  // Same collection gets highest score
  if (product1.collection === product2.collection) {
    score += 50;
  }

  // Similar price range
  const priceDiff = Math.abs(product1.price - product2.price);
  if (priceDiff < 1000) score += 30; // Within $10
  else if (priceDiff < 2000) score += 15; // Within $20

  // Shared colors
  const sharedColors = product1.colors.filter((c) =>
    product2.colors.includes(c)
  );
  score += sharedColors.length * 10;

  // Shared tags
  const sharedTags = product1.tags.filter((t) => product2.tags.includes(t));
  score += sharedTags.length * 5;

  // Both featured or bestsellers
  if (product1.featured && product2.featured) score += 10;
  if (
    product1.tags.includes("bestseller") &&
    product2.tags.includes("bestseller")
  ) {
    score += 10;
  }

  return score;
}

/**
 * Get product score for sorting
 */
function getProductScore(product: Product): number {
  let score = 0;
  if (product.featured) score += 3;
  if (product.tags.includes("bestseller")) score += 2;
  if (product.tags.includes("new")) score += 1;
  return score;
}

/**
 * Get most common items from an array
 */
function getMostCommon<T>(items: T[]): T[] {
  const counts = items.reduce((acc, item) => {
    acc.set(item, (acc.get(item) || 0) + 1);
    return acc;
  }, new Map<T, number>());

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([item]) => item);
}
