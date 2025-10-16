"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  verified: boolean;
  helpful: number;
  user: {
    name: string | null;
    email: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

interface ProductReviewsProps {
  productSlug: string;
}

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalReviews: 0, averageRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productSlug=${productSlug}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setStats(data.stats || { totalReviews: 0, averageRating: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setRating(0);
      setComment("");
      setShowReviewForm(false);

      // Refresh reviews
      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? (hoverRating || rating) : count)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Review Stats */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="mt-1">{renderStars(Math.round(stats.averageRating))}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {session ? (
        !showReviewForm ? (
          <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
        ) : (
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Write Your Review</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              {renderStars(rating, true)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comment (optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            Please sign in to write a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-medium">
                    {review.user.name || review.user.email.split("@")[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {review.comment && (
                <p className="mt-4 text-muted-foreground">{review.comment}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
