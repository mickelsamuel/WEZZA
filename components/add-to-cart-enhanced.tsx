'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { QuantitySelector } from '@/components/quantity-selector';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Zap, Ruler, Bell } from 'lucide-react';
import { StockIndicator, isSizeInStock, getSizeStock } from '@/components/stock-indicator';
import SizeRecommendationModal from '@/components/size-recommendation-modal';
import StockNotificationModal from '@/components/stock-notification-modal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast as sonnerToast } from 'sonner';
import { useAuthModal } from '@/contexts/auth-modal-context';

interface AddToCartEnhancedProps {
  product: Product;
}

export function AddToCartEnhanced({ product }: AddToCartEnhancedProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  // Get available stock for selected size
  const availableStock = selectedSize ? getSizeStock(product, selectedSize) : null;
  const maxQuantity = availableStock !== null ? availableStock : 10;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        description: 'Choose a size before adding to cart.',
        variant: 'destructive',
      });
      return;
    }

    // Check if size is in stock
    if (!isSizeInStock(product, selectedSize)) {
      toast({
        title: 'Out of stock',
        description: `${product.title} in size ${selectedSize} is currently unavailable.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if quantity exceeds available stock
    if (availableStock !== null && quantity > availableStock) {
      toast({
        title: 'Insufficient stock',
        description: `Only ${availableStock} items available in size ${selectedSize}.`,
        variant: 'destructive',
      });
      return;
    }

    addItem(product, selectedSize, quantity);
    toast({
      title: 'Added to cart',
      description: `${product.title} (${selectedSize}) x ${quantity}`,
    });
    setQuantity(1);
  };

  const handleBuyNow = async () => {
    if (!session) {
      openAuthModal();
      return;
    }

    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        description: 'Choose a size before purchasing.',
        variant: 'destructive',
      });
      return;
    }

    // Check if size is in stock
    if (!isSizeInStock(product, selectedSize)) {
      toast({
        title: 'Out of stock',
        description: `${product.title} in size ${selectedSize} is currently unavailable.`,
        variant: 'destructive',
      });
      return;
    }

    setBuyNowLoading(true);

    try {
      const response = await fetch('/api/checkout/buy-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSlug: product.slug,
          size: selectedSize,
          quantity,
          useDefaultPayment: true, // Try to use saved payment method
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If no default payment method, redirect to checkout
        if (data.error?.includes('default payment method')) {
          sonnerToast.error('Please add a payment method first', {
            description: 'Redirecting to checkout...',
          });

          // Add to cart first
          addItem(product, selectedSize, quantity);

          // Redirect to cart/checkout
          setTimeout(() => {
            router.push('/cart');
          }, 1000);
          return;
        }

        throw new Error(data.error || 'Failed to complete purchase');
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else if (data.orderId) {
        // Order completed successfully
        sonnerToast.success('Order placed successfully!');
        router.push(`/account?tab=orders`);
      }
    } catch (error: any) {
      console.error('Buy Now error:', error);
      sonnerToast.error(error.message || 'Failed to process purchase');
    } finally {
      setBuyNowLoading(false);
    }
  };

  const handleSizeRecommended = (size: string) => {
    setSelectedSize(size);
    sonnerToast.success(`Size ${size} selected based on your measurements`);
  };

  const handleNotifyMe = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        description: 'Choose a size to join the waitlist.',
        variant: 'destructive',
      });
      return;
    }
    setStockModalOpen(true);
  };

  const isSelectedSizeInStock = selectedSize ? isSizeInStock(product, selectedSize) : false;
  const isAnyOutOfStock = product.sizes.some((size) => !isSizeInStock(product, size));

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Size</Label>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSizeModalOpen(true)}
              className="text-brand-orange hover:text-brand-orange/80 h-auto p-0"
            >
              <Ruler className="w-4 h-4 mr-1" />
              Find My Size
            </Button>
          </div>
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
                      ? 'border-brand-black bg-brand-black text-white'
                      : sizeInStock
                      ? 'border-brand-gray hover:border-brand-black'
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
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
            {!isSelectedSizeInStock && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotifyMe}
                className="mt-2 w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Me When Available
              </Button>
            )}
          </div>
        )}

        {/* Show waitlist button if viewing out of stock size */}
        {isAnyOutOfStock && !selectedSize && (
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Some sizes are out of stock</p>
            <p className="text-xs text-gray-600 mb-3">
              Select an out-of-stock size to join the waitlist and get notified when it's back
            </p>
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

        {/* Buttons */}
        <div className="space-y-3">
          {/* Buy Now Button - One-click checkout */}
          <Button
            size="lg"
            className="w-full text-base bg-brand-orange hover:bg-brand-orange/90 font-bold"
            onClick={handleBuyNow}
            disabled={!product.inStock || (!!selectedSize && !isSelectedSizeInStock) || buyNowLoading}
          >
            {buyNowLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5 fill-current" />
                Buy Now - Fast Checkout
              </>
            )}
          </Button>

          {/* Regular Add to Cart */}
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base border-2 border-brand-black hover:bg-brand-black hover:text-white"
            onClick={handleAddToCart}
            disabled={!product.inStock || (!!selectedSize && !isSelectedSizeInStock)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {!product.inStock
              ? 'Out of Stock'
              : selectedSize && !isSelectedSizeInStock
              ? 'Size Out of Stock'
              : 'Add to Cart'}
          </Button>
        </div>

        {session && (
          <p className="text-xs text-center text-gray-500">
            <Zap className="w-3 h-3 inline mr-1" />
            Buy Now uses your saved address and payment method for instant checkout
          </p>
        )}
      </div>

      {/* Modals */}
      <SizeRecommendationModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        onSizeRecommended={handleSizeRecommended}
      />

      {selectedSize && (
        <StockNotificationModal
          isOpen={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          productSlug={product.slug}
          productTitle={product.title}
          size={selectedSize}
        />
      )}
    </>
  );
}
