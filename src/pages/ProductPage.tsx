import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatPrice } from "@/data/products";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ShoppingBag, Heart, Star, ArrowLeft, Check, Minus, Plus, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/product/ProductReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"ingredients" | "how-to-use" | "shipping">("ingredients");

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container grid gap-0 lg:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-6 p-8 lg:p-16">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center">
        <p className="font-heading text-2xl">Product not found</p>
        <Link to="/shop" className="mt-6 inline-block border-b-2 border-foreground pb-1 font-accent text-sm font-medium uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`Added ${qty} × ${product.name} to cart`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="container flex items-center gap-3 py-4">
          <Link to="/shop" className="flex items-center gap-1.5 font-accent text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={14} /> Shop
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-accent text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-accent text-xs uppercase tracking-widest text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="grid lg:grid-cols-2">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[4/5] overflow-hidden bg-secondary"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {discount > 0 && (
            <div className="absolute left-6 top-6 bg-foreground px-4 py-2 font-accent text-xs font-bold uppercase tracking-widest text-background">
              Save {discount}%
            </div>
          )}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <span key={badge} className="bg-background/90 px-3 py-1.5 font-accent text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                  {badge}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-20"
        >
          <p className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {product.brand}
          </p>

          <h1 className="mt-3 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? "fill-accent text-accent" : "text-border"}
                />
              ))}
            </div>
            <span className="font-accent text-xs tracking-wider text-muted-foreground">
              {product.rating} · {product.reviews} reviews
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-heading text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-accent text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 max-w-lg font-body text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Skin Type */}
          {product.skinType && product.skinType.length > 0 && (
            <div className="mt-6">
              <p className="font-accent text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Suitable for
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.skinType.map((type) => (
                  <span
                    key={type}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-accent text-xs tracking-wider"
                  >
                    <Check size={10} className="text-primary" /> {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <Minus size={14} />
              </button>
              <span className="flex h-12 w-10 items-center justify-center font-accent text-sm font-semibold">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 bg-foreground px-8 py-3 font-accent text-xs font-bold uppercase tracking-[0.15em] text-background transition-all hover:bg-primary"
            >
              <ShoppingBag size={16} /> Add to Bag
            </button>

            <button
              onClick={() => toggleWishlist.mutate(product.id)}
              className={`flex h-12 w-12 items-center justify-center border transition-all ${
                wishlisted
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Heart size={16} className={wishlisted ? "fill-current" : ""} />
            </button>

            <button
              onClick={handleShare}
              className="flex h-12 w-12 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Info Tabs */}
          <div className="mt-10 border-t border-border">
            <div className="flex border-b border-border">
              {(["ingredients", "how-to-use", "shipping"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 font-accent text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "how-to-use" ? "How to Use" : tab === "shipping" ? "Shipping" : "Ingredients"}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="py-5"
              >
                {activeTab === "ingredients" && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.ingredients || "Ingredient details coming soon."}
                  </p>
                )}
                {activeTab === "how-to-use" && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.howToUse || "Usage instructions coming soon."}
                  </p>
                )}
                {activeTab === "shipping" && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Standard delivery within Accra: GH₵35. Orders are processed within 1-2 business days. 
                    You'll receive a WhatsApp notification when your order is shipped.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <div className="border-t border-border">
        <div className="container py-16 lg:py-24">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="border-t border-border bg-secondary/30">
          <div className="container py-16 lg:py-24">
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-2xl font-bold md:text-3xl">You May Also Like</h2>
              <Link to="/shop" className="border-b border-foreground pb-0.5 font-accent text-xs uppercase tracking-widest">
                View All
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
