"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SortOption } from "@/lib/products";

interface FiltersProps {
  onColorChange: (colors: string[]) => void;
  onSizeChange: (sizes: string[]) => void;
  onCollectionChange: (collections: string[]) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

const COLORS = [
  { value: "black", label: "Black", hex: "#000000" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "orange", label: "Burnt Orange", hex: "#E37025" },
  { value: "peach", label: "Peach", hex: "#FAD4C0" },
  { value: "gray", label: "Warm Gray", hex: "#DCDCDC" },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLLECTIONS = ["Core", "Lunar", "Customizable"];

export function Filters({
  onColorChange,
  onSizeChange,
  onCollectionChange,
  onSortChange,
  onReset,
}: FiltersProps) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/site-content?section=filters")
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

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onColorChange(newColors);
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    onSizeChange(newSizes);
  };

  const toggleCollection = (collection: string) => {
    const newCollections = selectedCollections.includes(collection)
      ? selectedCollections.filter((c) => c !== collection)
      : [...selectedCollections, collection];
    setSelectedCollections(newCollections);
    onCollectionChange(newCollections);
  };

  const handleReset = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedCollections([]);
    onReset();
  };

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <Label className="text-base font-semibold">
          {content["filters.sort.label"] || "Sort By"}
        </Label>
        <Select onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder={content["filters.sort.placeholder"] || "Select sorting"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{content["filters.sort.newest"] || "Newest"}</SelectItem>
            <SelectItem value="price-low">{content["filters.sort.priceLow"] || "Price: Low to High"}</SelectItem>
            <SelectItem value="price-high">{content["filters.sort.priceHigh"] || "Price: High to Low"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Colors */}
      <div>
        <Label className="text-base font-semibold">
          {content["filters.color.label"] || "Color"}
        </Label>
        <div className="mt-3 flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => toggleColor(color.value)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                selectedColors.includes(color.value)
                  ? "scale-110 border-brand-orange shadow-lg"
                  : "border-gray-300 hover:scale-105"
              }`}
              style={{ backgroundColor: color.hex }}
              title={content[`filters.color.${color.value}`] || color.label}
            >
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sizes */}
      <div>
        <Label className="text-base font-semibold">
          {content["filters.size.label"] || "Size"}
        </Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`rounded-md border-2 px-4 py-2 font-semibold transition-all ${
                selectedSizes.includes(size)
                  ? "border-brand-orange bg-brand-orange text-white"
                  : "border-gray-300 hover:border-brand-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Collections */}
      <div>
        <Label className="text-base font-semibold">
          {content["filters.collection.label"] || "Collection"}
        </Label>
        <div className="mt-3 space-y-2">
          {COLLECTIONS.map((collection) => (
            <label key={collection} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCollections.includes(collection)}
                onChange={() => toggleCollection(collection)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>{collection}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <Button variant="outline" className="w-full" onClick={handleReset}>
        {content["filters.reset"] || "Reset Filters"}
      </Button>
    </div>
  );
}
