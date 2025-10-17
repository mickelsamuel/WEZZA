"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, Search, X, ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  section: string;
  description: string | null;
}

interface GroupedContent {
  [section: string]: ContentItem[];
}

// Category groupings for better organization
const CATEGORY_GROUPS = {
  pages: {
    name: "Pages",
    description: "Main website pages",
    sections: ["header", "navigation", "footer", "hero", "home", "about", "contact", "custom"],
  },
  shop: {
    name: "Shop & Products",
    description: "E-commerce and product pages",
    sections: ["shop", "product", "productCard", "productGrid", "cart", "checkout", "checkoutSuccess", "checkoutCancel", "orders"],
  },
  features: {
    name: "Product Features",
    description: "Product-related features",
    sections: ["addToCart", "filters", "reviews", "relatedProducts", "bestsellers", "recentlyViewed"],
  },
  user: {
    name: "User & Account",
    description: "User authentication and account",
    sections: ["auth", "user", "account", "wishlist", "wishlistButton"],
  },
  modals: {
    name: "Modals & Components",
    description: "Popups and interactive components",
    sections: ["sizeGuide", "sizeRec", "stockIndicator", "stockNotification"],
  },
  other: {
    name: "Other",
    description: "Search, navigation, and misc",
    sections: ["search", "searchResults", "instagram", "mobileNav"],
  },
};

// Section display names and descriptions
const SECTION_INFO: Record<string, { name: string; description: string }> = {
  // Core Pages
  header: { name: "Header & Navigation", description: "Main site header and navigation menu" },
  navigation: { name: "Navigation Links", description: "Site navigation menu links" },
  footer: { name: "Footer", description: "Site footer links and information" },
  hero: { name: "Hero Section", description: "Homepage hero banner" },
  home: { name: "Homepage", description: "Main homepage content" },

  // Content Pages
  about: { name: "About Page", description: "About us page content" },
  contact: { name: "Contact Page", description: "Contact form and information" },
  custom: { name: "Custom Orders Page", description: "Custom order request page" },

  // E-commerce
  shop: { name: "Shop Page", description: "Product listing and shop content" },
  product: { name: "Product Pages", description: "Individual product page content" },
  cart: { name: "Shopping Cart", description: "Cart page content" },
  checkout: { name: "Checkout", description: "Checkout flow content" },
  checkoutSuccess: { name: "Order Success", description: "Order confirmation page" },
  checkoutCancel: { name: "Order Cancelled", description: "Order cancellation page" },
  orders: { name: "Order Tracking", description: "Order tracking and status page" },

  // Product Features
  productCard: { name: "Product Cards", description: "Product card badges and labels" },
  productGrid: { name: "Product Grid", description: "Product grid empty states" },
  addToCart: { name: "Add to Cart", description: "Add to cart button and interactions" },
  filters: { name: "Product Filters", description: "Product filtering options" },
  reviews: { name: "Product Reviews", description: "Product review system" },
  relatedProducts: { name: "Related Products", description: "Related products section" },
  bestsellers: { name: "Bestsellers", description: "Bestsellers section" },
  recentlyViewed: { name: "Recently Viewed", description: "Recently viewed products" },

  // User Features
  auth: { name: "Authentication", description: "Sign in and registration" },
  user: { name: "User Menu", description: "User dropdown menu and account links" },
  account: { name: "User Account", description: "Account management page" },
  wishlist: { name: "Wishlist", description: "Wishlist feature" },
  wishlistButton: { name: "Wishlist Button", description: "Wishlist button interactions" },

  // Modals & Components
  sizeGuide: { name: "Size Guide Modal", description: "Size guide and measurements" },
  sizeRec: { name: "Size Recommendation", description: "AI size recommendation tool" },
  stockIndicator: { name: "Stock Indicators", description: "Stock status messages" },
  stockNotification: { name: "Stock Notifications", description: "Stock alert waitlist" },

  // Search & Discovery
  search: { name: "Search Bar", description: "Search input and interface" },
  searchResults: { name: "Search Results", description: "Search results display" },

  // Other
  instagram: { name: "Instagram Feed", description: "Instagram gallery section" },
  mobileNav: { name: "Mobile Navigation", description: "Mobile menu" },
};

export default function SiteContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [grouped, setGrouped] = useState<GroupedContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("pages");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/site-content");
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
        setGrouped(data.grouped || {});
      } else {
        toast.error("Failed to load site content");
      }
    } catch (error) {
      toast.error("Error loading content");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, newValue: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const updates = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value,
      }));

      const response = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Content updated successfully!");
        setEditedValues({});
        fetchContent(); // Refresh content
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update content");
      }
    } catch (error) {
      toast.error("Error saving content");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filteredContent = searchQuery
    ? content.filter(
        (item) =>
          item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : content;

  const filteredGrouped = searchQuery
    ? filteredContent.reduce((acc: GroupedContent, item) => {
        if (!acc[item.section]) {
          acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
      }, {})
    : grouped;

  // Get sections for current category
  const getSectionsForCategory = (categoryKey: string) => {
    const category = CATEGORY_GROUPS[categoryKey as keyof typeof CATEGORY_GROUPS];
    if (!category) return [];

    return category.sections
      .filter(section => filteredGrouped[section])
      .map(section => ({
        section,
        items: filteredGrouped[section],
      }));
  };

  // Count items in category
  const getCategoryItemCount = (categoryKey: string) => {
    const sections = getSectionsForCategory(categoryKey);
    return sections.reduce((sum, { items }) => sum + items.length, 0);
  };

  // Count changes in category
  const getCategoryChangesCount = (categoryKey: string) => {
    const sections = getSectionsForCategory(categoryKey);
    let count = 0;
    sections.forEach(({ items }) => {
      items.forEach(item => {
        if (editedValues[item.key] !== undefined) {
          count++;
        }
      });
    });
    return count;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(editedValues).length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">Site Content</h1>
              <p className="text-gray-600 mt-1">
                Edit all text content across your website
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              size="lg"
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes {hasChanges && `(${Object.keys(editedValues).length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by key, value, section, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Found {filteredContent.length} items matching "{searchQuery}"
          </p>
        )}
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Items</div>
          <div className="mt-1 font-heading text-3xl font-bold">{content.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Sections</div>
          <div className="mt-1 font-heading text-3xl font-bold">
            {Object.keys(grouped).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending Changes</div>
          <div className="mt-1 font-heading text-3xl font-bold text-brand-orange">
            {Object.keys(editedValues).length}
          </div>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          {Object.entries(CATEGORY_GROUPS).map(([key, category]) => {
            const changesCount = getCategoryChangesCount(key);
            return (
              <TabsTrigger key={key} value={key} className="relative">
                {category.name}
                {changesCount > 0 && (
                  <span className="ml-1 rounded-full bg-brand-orange px-1.5 py-0.5 text-xs text-white">
                    {changesCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(CATEGORY_GROUPS).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey}>
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getCategoryItemCount(categoryKey)} items
                </p>
              </div>

              <Separator className="mb-6" />

              {getSectionsForCategory(categoryKey).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {searchQuery
                    ? "No content items match your search in this category"
                    : "No content items found in this category"}
                </div>
              ) : (
                <Accordion type="multiple" defaultValue={category.sections}>
                  {getSectionsForCategory(categoryKey).map(({ section, items }) => {
                    const sectionInfo = SECTION_INFO[section];
                    const sectionChangesCount = items.filter(
                      item => editedValues[item.key] !== undefined
                    ).length;

                    return (
                      <AccordionItem key={section} value={section}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-3">
                              <span className="font-heading text-lg font-bold">
                                {sectionInfo?.name || section}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                {items.length} items
                              </span>
                              {sectionChangesCount > 0 && (
                                <span className="rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-semibold text-brand-orange">
                                  {sectionChangesCount} edited
                                </span>
                              )}
                            </div>
                            {sectionInfo?.description && (
                              <span className="text-sm font-normal text-muted-foreground">
                                {sectionInfo.description}
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            {items.map((item) => {
                              const currentValue =
                                editedValues[item.key] !== undefined
                                  ? editedValues[item.key]
                                  : item.value;
                              const isEdited = editedValues[item.key] !== undefined;
                              const isLongText = item.value.length > 100;

                              return (
                                <div
                                  key={item.key}
                                  className={`rounded-lg border p-4 transition-colors ${
                                    isEdited ? "border-brand-orange bg-brand-orange/5" : ""
                                  }`}
                                >
                                  <div className="mb-2 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <Label className="font-mono text-xs text-muted-foreground break-all">
                                        {item.key}
                                      </Label>
                                      {item.description && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    {isEdited && (
                                      <span className="rounded-full bg-brand-orange px-2 py-1 text-xs font-semibold text-white flex-shrink-0">
                                        Modified
                                      </span>
                                    )}
                                  </div>
                                  {isLongText ? (
                                    <Textarea
                                      value={currentValue}
                                      onChange={(e) => handleValueChange(item.key, e.target.value)}
                                      className="mt-2 min-h-[120px] font-normal"
                                      placeholder="Enter text content..."
                                    />
                                  ) : (
                                    <Input
                                      value={currentValue}
                                      onChange={(e) => handleValueChange(item.key, e.target.value)}
                                      className="mt-2 font-normal"
                                      placeholder="Enter text content..."
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Floating Save Button for mobile */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            {saving ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Save className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
