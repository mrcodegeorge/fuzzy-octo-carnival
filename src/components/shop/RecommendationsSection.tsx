import { useMemo } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/data/products";

interface RecommendationsSectionProps {
  products: Product[];
  isLoading: boolean;
  activeCategory?: string;
  activeBrand?: string;
  categoryName?: string;
  excludeIds?: string[];
}

const RecommendationsSection = ({
  products,
  isLoading,
  activeCategory,
  activeBrand,
  categoryName,
  excludeIds = [],
}: RecommendationsSectionProps) => {
  const recommendations = useMemo(() => {
    let pool = [...products].filter((p) => !excludeIds.includes(p.id));

    // If browsing a category, surface top-rated in that category first
    if (activeCategory) {
      const inCategory = pool
        .filter((p) => p.category === activeCategory)
        .sort((a, b) => b.rating - a.rating);
      const others = pool
        .filter((p) => p.category !== activeCategory)
        .sort((a, b) => b.rating - a.rating);
      pool = [...inCategory, ...others];
    } else if (activeBrand) {
      const inBrand = pool
        .filter((p) => p.brand === activeBrand)
        .sort((a, b) => b.rating - a.rating);
      const others = pool
        .filter((p) => p.brand !== activeBrand)
        .sort((a, b) => b.rating - a.rating);
      pool = [...inBrand, ...others];
    } else {
      // Default: top-rated best sellers
      pool.sort((a, b) => b.rating - a.rating);
    }

    return pool.slice(0, 4);
  }, [products, activeCategory, activeBrand, excludeIds]);

  const label = activeCategory
    ? `More in ${categoryName || activeCategory}`
    : activeBrand
    ? `More from ${activeBrand}`
    : "Best Sellers";

  const isContextual = !!(activeCategory || activeBrand);

  if (!isLoading && recommendations.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16 border-t border-border pt-14"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isContextual ? (
              <Sparkles size={15} className="text-primary" />
            ) : (
              <TrendingUp size={15} className="text-primary" />
            )}
            <span className="font-accent text-xs font-bold uppercase tracking-[0.25em] text-primary">
              {isContextual ? "Recommended" : "Trending"}
            </span>
          </div>
          <h2 className="mt-1 font-heading text-2xl font-bold md:text-3xl">{label}</h2>
        </div>
        <div className="hidden h-px flex-1 max-w-[200px] self-center bg-border sm:block ml-6" />
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          : recommendations.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
      </div>
    </motion.section>
  );
};

export default RecommendationsSection;
