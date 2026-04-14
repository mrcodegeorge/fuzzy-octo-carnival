import { useState } from "react";
import { Star, Send } from "lucide-react";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useReviews(productId);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview.mutate(
      { productId, rating, comment },
      { onSuccess: () => { setComment(""); setRating(5); } }
    );
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="mt-16">
      <h2 className="font-heading text-2xl font-bold">Customer Reviews</h2>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-4">
        <div className="text-center">
          <p className="font-heading text-4xl font-bold">{avgRating}</p>
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(Number(avgRating)) ? "fill-gold text-gold" : "text-border"} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
        </div>
      </div>

      {/* Submit form */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        {user ? (
          <form onSubmit={handleSubmit}>
            <p className="text-sm font-semibold mb-3">Write a Review</p>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    size={22}
                    className={`transition-colors cursor-pointer ${
                      i < (hoverRating || rating) ? "fill-gold text-gold" : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={submitReview.isPending}
              className="btn-beauty mt-3 flex items-center gap-2 text-xs"
            >
              <Send size={14} />
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary hover:underline font-medium">Sign in</Link> to leave a review
            </p>
          </div>
        )}
      </div>

      {/* Reviews list */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                  <span className="text-xs font-medium">
                    {(review as any).profile?.full_name || "Customer"}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
