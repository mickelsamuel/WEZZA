"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import Link from "next/link";

interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  sortOrder: number;
  _count?: { products: number };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description: "",
    imageUrl: "",
    featured: false,
    sortOrder: 0,
  });

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/admin/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/admin/collections/${editingId}` : "/api/admin/collections";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success(`Collection ${editingId ? "updated" : "created"} successfully!`);
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchCollections();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingId ? "update" : "create"} collection`);
    }
  };

  const handleEdit = (collection: Collection) => {
    setFormData({
      slug: collection.slug,
      name: collection.name,
      description: collection.description || "",
      imageUrl: collection.imageUrl || "",
      featured: collection.featured,
      sortOrder: collection.sortOrder,
    });
    setEditingId(collection.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/collections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Collection deleted successfully!");
      fetchCollections();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete collection");
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      name: "",
      description: "",
      imageUrl: "",
      featured: false,
      sortOrder: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-gray-600 mt-1">Manage product collections</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Collection" : "Create New Collection"}</CardTitle>
            <CardDescription>
              {editingId ? "Update collection details" : "Add a new collection to organize products"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Collection Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Core Collection"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="e.g., core"
                    required
                    disabled={!!editingId}
                  />
                  {editingId && <p className="text-xs text-gray-500">Slug cannot be changed</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this collection..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Collection Image</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(value) => setFormData({ ...formData, imageUrl: value as string })}
                  category="site"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Lower numbers appear first</p>
                </div>

                <div className="flex items-center gap-4 pt-8">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded"
                  />
                  <Label htmlFor="featured" className="font-normal">
                    Featured collection
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  {editingId ? "Update Collection" : "Create Collection"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Collections List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {collection.imageUrl && (
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    {collection.featured && (
                      <span className="text-xs bg-brand-orange text-white px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">/{collection.slug}</p>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{collection.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>{collection._count?.products || 0} products</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(collection)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(collection.id, collection.name)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {collections.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
            <p className="text-gray-600 mb-4">Create your first collection to organize products</p>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
