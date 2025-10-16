"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/image-upload";

interface Collection {
  id: string;
  slug: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    price: 5999,
    currency: "CAD",
    collectionId: "",
    inStock: true,
    featured: false,
    images: [] as string[],
    fabric: "100% premium heavyweight cotton (350gsm)",
    care: "Machine wash cold, tumble dry low. Do not bleach.",
    shipping: "Free shipping on orders over $100 CAD. 5-7 business days delivery.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["black"],
    tags: [] as string[],
  });

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/admin/collections");
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
          if (data.length > 0 && !formData.collectionId) {
            setFormData((prev) => ({ ...prev, collectionId: data[0].id }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };
    fetchCollections();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        toast.error("Slug must contain only lowercase letters, numbers, and hyphens");
        setSaving(false);
        return;
      }

      // Validate images
      if (formData.images.length === 0) {
        toast.error("Please upload at least one product image");
        setSaving(false);
        return;
      }

      // Create product via API
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create product");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images *</CardTitle>
            <CardDescription>Upload product photos (first image will be the main image)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={formData.images}
              onChange={(value) => handleInputChange("images", value)}
              multiple
              category="product"
              maxFiles={5}
            />
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic product details and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Core Hoodie — Black"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    handleInputChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                  }
                  placeholder="e.g., core-black"
                  required
                />
                <p className="text-xs text-gray-500">URL-friendly identifier (lowercase, hyphens only)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (cents) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseInt(e.target.value) || 0)}
                  placeholder="5999"
                  required
                />
                <p className="text-xs text-gray-500">Preview: ${(formData.price / 100).toFixed(2)} CAD</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection">Collection *</Label>
                <Select
                  value={formData.collectionId}
                  onValueChange={(value) => handleInputChange("collectionId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock & Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Stock & Availability</CardTitle>
            <CardDescription>Manage product availability and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
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
                checked={formData.featured}
                onChange={(e) => handleInputChange("featured", e.target.checked)}
                className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded"
              />
              <Label htmlFor="featured" className="font-normal">
                Featured product (show on homepage)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Fabric, care instructions, and shipping information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fabric">Fabric & Construction</Label>
              <Textarea
                id="fabric"
                value={formData.fabric}
                onChange={(e) => handleInputChange("fabric", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="care">Care Instructions</Label>
              <Textarea
                id="care"
                value={formData.care}
                onChange={(e) => handleInputChange("care", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Information</Label>
              <Textarea
                id="shipping"
                value={formData.shipping}
                onChange={(e) => handleInputChange("shipping", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {saving ? "Creating..." : "Create Product"}
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
