import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight } from "lucide-react";

const FeaturedProducts = () => {
  const { data: products, isLoading } = useProducts();
  const featured = (products ?? []).slice(0, 8);

  return (
    <section className="section-padding rose-gradient">
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
                Curated
              </span>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-5xl">
              Featured <span className="italic">Products</span>
            </h2>
            <p className="mt-2 font-accent text-sm text-muted-foreground">
              Handpicked favorites our customers love
            </p>
          </motion.div>
          <Link to="/shop" className="hidden font-accent text-sm font-medium text-foreground hover:text-primary md:flex items-center gap-1 transition-colors">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/shop" className="btn-beauty-outline text-xs">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
