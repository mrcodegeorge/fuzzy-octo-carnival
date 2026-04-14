import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/useProducts";
import * as LucideIcons from "lucide-react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryIcon = ({ iconName, size = 28 }: { iconName: string | null; size?: number }) => {
  if (!iconName) return <Sparkles size={size} />;
  const Icon = (LucideIcons as any)[iconName];
  if (Icon) return <Icon size={size} />;
  // Fallback for emojis or unknown icon names
  return <span style={{ fontSize: `${size}px` }}>{iconName}</span>;
};

const CategoriesSection = () => {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="section-padding">
      <div className="container">
        <div className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <div className="editorial-line" />
              <span className="font-accent text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
                Categories
              </span>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-5xl">
              Shop by <span className="italic">Category</span>
            </h2>
          </motion.div>
          <Link to="/shop" className="hidden font-accent text-sm font-medium text-foreground hover:text-primary md:flex items-center gap-1 transition-colors">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 border border-border p-6">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            : (categories ?? []).map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group flex flex-col gap-4 border border-border bg-card p-6 transition-all duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground transition-colors group-hover:text-background/70">
                        <CategoryIcon iconName={cat.icon} />
                      </span>
                      <ArrowUpRight size={16} className="opacity-0 transition-all group-hover:opacity-100" />
                    </div>
                    <span className="font-accent text-sm font-medium">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
