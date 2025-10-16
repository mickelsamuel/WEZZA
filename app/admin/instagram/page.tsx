"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Instagram, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TOTAL_IMAGES = 6;

export default function InstagramGalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current images
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch("/api/admin/instagram");
        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        }
      } catch (error) {
        console.error("Failed to load Instagram images:", error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  const handleImageUpload = async (index: number, file: File) => {
    setUploading(true);

    try {
      // Validate file
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Upload image
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "site");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      // Update images array
      const newImages = [...images];
      newImages[index] = imageUrl;
      setImages(newImages);

      // Save to database
      await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      });

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const newImages = [...images];
      newImages[index] = "";
      setImages(newImages);

      await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      });

      toast.success("Image removed");
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Instagram gallery...</p>
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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Instagram className="h-8 w-8" />
            Instagram Gallery
          </h1>
          <p className="text-gray-600 mt-1">
            Manage the 6 Instagram images displayed at the bottom of your homepage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Instagram Strip</CardTitle>
          <CardDescription>
            Upload 6 images that will be displayed in the "Follow @WEZZA" section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: TOTAL_IMAGES }).map((_, index) => {
              const imageUrl = images[index];
              return (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-brand-orange transition-colors group">
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt={`Instagram ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Upload</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(index, file);
                            }
                          }}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-center text-gray-500">Image {index + 1}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Use square images (1:1 ratio) for best results. Images will be displayed in a grid on your homepage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How it will look on your homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="text-center mb-6">
              <h2 className="font-heading text-3xl font-bold">Follow @WEZZA</h2>
              <p className="mt-2 text-gray-600">See how our community styles their hoodies</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {images.slice(0, TOTAL_IMAGES).map((img, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
                  {img ? (
                    <Image
                      src={img}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
