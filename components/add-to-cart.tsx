"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QuantitySelector } from "@/components/quantity-selector";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart } from "lucide-react";
import { StockIndicator, isSizeInStock, getSizeStock } from "@/components/stock-indicator";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  // Get available stock for selected size
  const availableStock = selectedSize ? getSizeStock(product, selectedSize) : null;
  const maxQuantity = availableStock !== null ? availableStock : 10; // Default max to 10 if no stock data

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if size is in stock
    if (!isSizeInStock(product, selectedSize)) {
      toast({
        title: "Out of stock",
        description: `${product.title} in size ${selectedSize} is currently unavailable.`,
        variant: "destructive",
      });
      return;
    }

    // Check if quantity exceeds available stock
    if (availableStock !== null && quantity > availableStock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${availableStock} items available in size ${selectedSize}.`,
        variant: "destructive",
      });
      return;
    }

    addItem(product, selectedSize, quantity);
    toast({
      title: "Added to cart",
      description: `${product.title} (${selectedSize}) x ${quantity}`,
    });
    setQuantity(1);
  };

  const isSelectedSizeInStock = selectedSize ? isSizeInStock(product, selectedSize) : false;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Size</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const sizeInStock = isSizeInStock(product, size);
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={!sizeInStock}
                className={`rounded-md border-2 px-6 py-3 font-semibold transition-all ${
                  selectedSize === size
                    ? "border-brand-black bg-brand-black text-white"
                    : sizeInStock
                    ? "border-brand-gray hover:border-brand-black"
                    : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Indicator */}
      {selectedSize && (
        <div className="pt-2">
          <StockIndicator product={product} selectedSize={selectedSize} />
        </div>
      )}

      <div>
        <Label className="text-base font-semibold">Quantity</Label>
        <div className="mt-3">
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            max={maxQuantity > 0 ? maxQuantity : 1}
          />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full text-base"
        onClick={handleAddToCart}
        disabled={!product.inStock || (!!selectedSize && !isSelectedSizeInStock)}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {!product.inStock ? "Out of Stock" : (selectedSize && !isSelectedSizeInStock) ? "Size Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
