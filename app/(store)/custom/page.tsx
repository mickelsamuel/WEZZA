"use client";

import { useState, useEffect } from "react";

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
  const [content, setContent] = useState<Record<string, string>>({});
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

  useEffect(() => {
    fetch("/api/site-content?section=custom")
      .then((res) => res.json())
      .then((data) => {
        const contentMap: Record<string, string> = {};
        data.content?.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }, []);

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
        title: content["custom.toast.success.title"] || "Order submitted!",
        description: content["custom.toast.success.description"] || "We'll contact you within 24 hours to discuss your custom design.",
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
        title: content["custom.toast.error.title"] || "Submission failed",
        description: error instanceof Error ? error.message : (content["custom.toast.error.description"] || "Please try again"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center sm:py-20">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 sm:h-24 sm:w-24" />
        <h1 className="mt-4 font-heading text-2xl font-bold sm:mt-6 sm:text-3xl">
          {content["custom.success.title"] || "Order Submitted!"}
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
          {content["custom.success.message"] || "Thank you for your custom order request."}
          <br />
          {content["custom.success.followUp"] || "We'll review your design notes and get back to you within 24 hours."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
          <Button onClick={() => setIsSubmitted(false)} className="w-full sm:w-auto">
            {content["custom.success.submitAnother"] || "Submit Another"}
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/shop")} className="w-full sm:w-auto">
            {content["custom.success.continueShopping"] || "Continue Shopping"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
            {content["custom.pageTitle"] || "Custom Orders"}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {content["custom.pageDescription"] || "Create your perfect hoodie. Starting at $89.99 CAD"}
          </p>
        </div>

        <Card className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base">{content["custom.form.name.label"] || "Full Name *"}</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 sm:mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">{content["custom.form.email.label"] || "Email *"}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5 sm:mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="color">{content["custom.form.color.label"] || "Hoodie Color *"}</Label>
                <Select
                  required
                  value={formData.hoodieColor}
                  onValueChange={(value) => setFormData({ ...formData, hoodieColor: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={content["custom.form.color.placeholder"] || "Select a color"} />
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
                <Label htmlFor="size">{content["custom.form.size.label"] || "Size *"}</Label>
                <Select
                  required
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={content["custom.form.size.placeholder"] || "Select a size"} />
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
              <Label htmlFor="designNotes">{content["custom.form.designNotes.label"] || "Design Notes *"}</Label>
              <Textarea
                id="designNotes"
                required
                value={formData.designNotes}
                onChange={(e) => setFormData({ ...formData, designNotes: e.target.value })}
                placeholder={content["custom.form.designNotes.placeholder"] || "Describe your design idea in detail. Include placement, colors, text, graphics, etc."}
                className="mt-2 min-h-[150px]"
              />
            </div>

            <div>
              <Label>{content["custom.form.image.label"] || "Design Image (Optional)"}</Label>
              <p className="mt-1 mb-3 text-sm text-muted-foreground">
                {content["custom.form.image.description"] || "Upload a design mockup, sketch, or reference image"}
              </p>
              <ImageUpload
                onImageChange={handleImageChange}
                existingPreview={imagePreview}
                maxSize={5}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">{content["custom.form.imageUrl.label"] || "Or Paste Image URL (Optional)"}</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder={content["custom.form.imageUrl.placeholder"] || "https://example.com/your-design.jpg"}
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {content["custom.form.imageUrl.description"] || "Already have your design hosted online? Paste the link here."}
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? (content["custom.form.submit.submitting"] || "Submitting...")
                : (content["custom.form.submit.default"] || "Submit Custom Order")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {content["custom.form.footer"] || "We'll review your request and email you within 24 hours with pricing and timeline."}
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
