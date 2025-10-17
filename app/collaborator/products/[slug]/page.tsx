import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductStats } from "@/components/product-stats";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function CollaboratorProductPage({
  params,
}: {
  params: { slug: string };
}) {
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

  // Get product
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      collaborators: {
        where: {
          userId: currentUser.id,
        },
      },
    },
  });

  // Check if product exists and user is a collaborator
  if (!product || product.collaborators.length === 0) {
    redirect("/collaborator");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/collaborator">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-gray-600 mt-1">Product Analytics & Details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details about this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Product Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.images && (product.images as string[]).length > 0 ? (
                      (product.images as string[]).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border"
                        >
                          <Image
                            src={image}
                            alt={`${product.title} image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center p-8 text-gray-500">
                        No images available
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Pricing</h3>
                    <p className="text-2xl font-bold text-brand-orange">
                      ${(product.price / 100).toFixed(2)} {product.currency}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      {product.featured && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {product.fabric && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Fabric & Construction
                      </h3>
                      <p className="text-gray-600 text-sm">{product.fabric}</p>
                    </div>
                  )}

                  {product.care && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Care Instructions
                      </h3>
                      <p className="text-gray-600 text-sm">{product.care}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Analytics */}
          <ProductStats productSlug={product.slug} productTitle={product.title} />
        </div>
      </div>
    </div>
  );
}
