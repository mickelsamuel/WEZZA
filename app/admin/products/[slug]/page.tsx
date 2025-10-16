"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProductData {
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  collectionId: string | null;
  inStock: boolean;
  featured: boolean;
  images: string[];
  fabric: string;
  care: string;
  shipping: string;
  sizes: string[];
  colors: string[];
  tags: string[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProduct();
    loadCollections();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setProduct(data.products[0]);
        } else {
          toast.error("Product not found");
          router.push("/admin/products");
        }
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await fetch("/api/admin/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);

    try {
      // First get the product ID
      const getResponse = await fetch(`/api/admin/products?slug=${product.slug}`);
      if (!getResponse.ok) {
        toast.error("Failed to find product");
        return;
      }

      const getData = await getResponse.json();
      const productId = getData.products[0]?.id;

      if (!productId) {
        toast.error("Product ID not found");
        return;
      }

      // Now update the product
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        toast.success("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProductData, value: any) => {
    if (product) {
      setProduct({ ...product, [field]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (product) {
          setProduct({
            ...product,
            images: [...product.images, data.url],
          });
        }
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (product) {
      const newImages = product.images.filter((_, i) => i !== index);
      setProduct({ ...product, images: newImages });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Manage product images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-orange cursor-pointer flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    {uploadingImage ? "Uploading..." : "Add Image"}
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic product details and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={product.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={product.slug}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Slug cannot be changed</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={product.price}
                  onChange={(e) => handleInputChange("price", parseInt(e.target.value))}
                  required
                />
                <p className="text-xs text-gray-500">
                  Current: ${(product.price / 100).toFixed(2)} CAD
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={product.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection">Collection</Label>
                <Select
                  value={product.collectionId || "none"}
                  onValueChange={(value) => handleInputChange("collectionId", value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Collection</SelectItem>
                    {collections.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock & Availability</CardTitle>
            <CardDescription>Manage product availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="inStock"
                checked={product.inStock}
                onChange={(e) => handleInputChange("inStock", e.target.checked)}
                className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded"
              />
              <Label htmlFor="inStock" className="font-normal">
                Product is in stock
              </Label>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="featured"
                checked={product.featured}
                onChange={(e) => handleInputChange("featured", e.target.checked)}
                className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded"
              />
              <Label htmlFor="featured" className="font-normal">
                Featured product
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Fabric, care instructions, and shipping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fabric">Fabric & Construction</Label>
              <Textarea
                id="fabric"
                value={product.fabric}
                onChange={(e) => handleInputChange("fabric", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="care">Care Instructions</Label>
              <Textarea
                id="care"
                value={product.care}
                onChange={(e) => handleInputChange("care", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Information</Label>
              <Textarea
                id="shipping"
                value={product.shipping}
                onChange={(e) => handleInputChange("shipping", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
