"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value?: string | string[]; // Single URL or array of URLs
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  category?: "product" | "site" | "general";
  maxFiles?: number;
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  category = "general",
  maxFiles = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check file count limit
    if (multiple && preview.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiple) {
        const newUrls = [...preview, ...uploadedUrls];
        setPreview(newUrls);
        onChange(newUrls);
      } else {
        setPreview([uploadedUrls[0]]);
        onChange(uploadedUrls[0]);
      }

      toast.success(
        `${uploadedUrls.length} ${uploadedUrls.length === 1 ? "image" : "images"} uploaded successfully`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = preview.filter((_, i) => i !== index);
    setPreview(newUrls);
    onChange(multiple ? newUrls : newUrls[0] || "");
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          multiple={multiple}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || (!multiple && preview.length > 0)}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : multiple ? "Upload Images" : "Upload Image"}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, WebP, or GIF (max 5MB)
          {multiple && ` • Up to ${maxFiles} images`}
        </p>
      </div>

      {/* Preview Grid */}
      {preview.length > 0 && (
        <div className={`grid gap-4 ${multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
          {preview.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              {multiple && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Image {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {preview.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click the button above to upload {multiple ? "images" : "an image"}
          </p>
        </div>
      )}
    </div>
  );
}
