"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageChange: (file: File | null, preview: string | null) => void;
  existingPreview?: string | null;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
}

export function ImageUpload({
  onImageChange,
  existingPreview,
  maxSize = 5,
  accept = "image/*",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingPreview || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return false;
    }

    // Check file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setPreview(previewUrl);
        onImageChange(file, previewUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange, maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageChange]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      {preview ? (
        // Preview State
        <div className="relative">
          <div className="group relative overflow-hidden rounded-xl border-2 border-brand-orange/50 bg-black/10 p-2">
            <img
              src={preview}
              alt="Upload preview"
              className="h-64 w-full rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove Image
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Upload State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
            isDragging
              ? "border-brand-orange bg-brand-orange/10 scale-[1.02]"
              : "border-muted-foreground/30 hover:border-brand-orange/50 hover:bg-muted/50",
            error && "border-red-500/50 bg-red-500/5"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={cn(
                "rounded-full p-4 transition-colors",
                isDragging
                  ? "bg-brand-orange text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isDragging ? (
                <Upload className="h-8 w-8" />
              ) : (
                <ImageIcon className="h-8 w-8" />
              )}
            </div>

            <div>
              <p className="text-lg font-semibold">
                {isDragging ? "Drop your image here" : "Upload Design Image"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>

            {!isDragging && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white"
              >
                Choose File
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
