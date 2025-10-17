import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function CollaboratorDashboard() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Check if user has collaborator role
  if (!currentUser || currentUser.role?.toLowerCase() !== "collaborator") {
    redirect("/");
  }

  // Get products where this user is a collaborator
  const collaborations = await prisma.productCollaborator.findMany({
    where: { userId: currentUser.id },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const products = collaborations.map((collab) => collab.product);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Collaborator Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {currentUser.name || currentUser.email}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Total Products
              </CardTitle>
              <CardDescription>Products you collaborate on</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-brand-orange">{products.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Active Collaborations
              </CardTitle>
              <CardDescription>Currently in stock</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {products.filter((p) => p.inStock).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>
              Click on a product to view detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products yet
                </h3>
                <p className="text-gray-600">
                  You haven't been added to any products yet. Contact an administrator to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/collaborator/products/${product.slug}`}
                    className="group"
                  >
                    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-100">
                        {product.images && (product.images as string[]).length > 0 ? (
                          <Image
                            src={(product.images as string[])[0]}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        {/* Stock Badge */}
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.inStock
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          ${(product.price / 100).toFixed(2)} {product.currency}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
