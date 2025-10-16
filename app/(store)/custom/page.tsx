"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2 } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

const COLORS = ["Black", "White", "Burnt Orange", "Peach", "Warm Gray", "Other"];
const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hoodieColor: "",
    size: "",
    designNotes: "",
    imageUrl: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (file: File | null, preview: string | null) => {
    setUploadedFile(file);
    setImagePreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create submission data with uploaded image
      const submissionData = {
        ...formData,
        designImage: imagePreview, // Include base64 image if uploaded
        hasUploadedImage: !!uploadedFile,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit custom order");
      }

      setIsSubmitted(true);
      toast({
        title: "Order submitted!",
        description: "We'll contact you within 24 hours to discuss your custom design.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        hoodieColor: "",
        size: "",
        designNotes: "",
        imageUrl: "",
      });
      setUploadedFile(null);
      setImagePreview(null);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-24 w-24 text-green-500" />
        <h1 className="mt-6 font-heading text-3xl font-bold">Order Submitted!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Thank you for your custom order request.
          <br />
          We'll review your design notes and get back to you within 24 hours.
        </p>
        <div className="mt-8 space-x-4">
          <Button onClick={() => setIsSubmitted(false)}>Submit Another</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Custom Orders</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your perfect hoodie. Starting at $89.99 CAD
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="color">Hoodie Color *</Label>
                <Select
                  required
                  value={formData.hoodieColor}
                  onValueChange={(value) => setFormData({ ...formData, hoodieColor: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size">Size *</Label>
                <Select
                  required
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="designNotes">Design Notes *</Label>
              <Textarea
                id="designNotes"
                required
                value={formData.designNotes}
                onChange={(e) => setFormData({ ...formData, designNotes: e.target.value })}
                placeholder="Describe your design idea in detail. Include placement, colors, text, graphics, etc."
                className="mt-2 min-h-[150px]"
              />
            </div>

            <div>
              <Label>Design Image (Optional)</Label>
              <p className="mt-1 mb-3 text-sm text-muted-foreground">
                Upload a design mockup, sketch, or reference image
              </p>
              <ImageUpload
                onImageChange={handleImageChange}
                existingPreview={imagePreview}
                maxSize={5}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Or Paste Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/your-design.jpg"
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Already have your design hosted online? Paste the link here.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Custom Order"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              We'll review your request and email you within 24 hours with pricing and timeline.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
