"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuthModal } from "@/contexts/auth-modal-context";

interface WishlistButtonProps {
  productSlug: string;
  variant?: "default" | "icon";
}

export function WishlistButton({ productSlug, variant = "default" }: WishlistButtonProps) {
  const { data: session, status } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (status === "authenticated") {
      checkWishlistStatus();
    }
  }, [status, productSlug]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const { wishlist } = await response.json();
        setIsInWishlist(wishlist.some((item: any) => item.productSlug === productSlug));
      }
    } catch (error) {
      console.error("Failed to check wishlist status:", error);
    }
  };

  const handleToggleWishlist = async () => {
    if (status !== "authenticated") {
      openAuthModal();
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productSlug=${productSlug}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsInWishlist(false);
          toast({
            title: "Removed from wishlist",
            description: "Product removed from your wishlist",
          });
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSlug }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast({
            title: "Added to wishlist",
            description: "Product added to your wishlist",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={isLoading}
        className={`rounded-full p-2 transition-all hover:bg-white/20 ${
          isInWishlist ? "text-red-500" : "text-white"
        }`}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`}
        />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className="gap-2"
    >
      <Heart
        className={`h-5 w-5 ${isInWishlist ? "fill-current text-red-500" : ""}`}
      />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
