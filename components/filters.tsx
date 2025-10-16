"use client";

import { useState } from "react";
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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

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
        <Label className="text-base font-semibold">Sort By</Label>
        <Select onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Colors */}
      <div>
        <Label className="text-base font-semibold">Color</Label>
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
              title={color.label}
            >
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sizes */}
      <div>
        <Label className="text-base font-semibold">Size</Label>
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
        <Label className="text-base font-semibold">Collection</Label>
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
        Reset Filters
      </Button>
    </div>
  );
}
