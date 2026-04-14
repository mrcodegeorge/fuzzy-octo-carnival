import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { formatPrice } from "@/data/products";
import { useProducts, useCategories, useBrands } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X, Grid3X3, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const activeCategory = searchParams.get("category") || "";
  const activeBrand = searchParams.get("brand") || "";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (activeBrand) result = result.filter((p) => p.brand === activeBrand);

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [products, activeCategory, activeBrand, sortBy]);

  const clearFilters = () => {
    setSearchParams({});
    setSortBy("newest");
  };

  const hasFilters = activeCategory || activeBrand;

  return (
    <div className="min-h-screen">
      {/* Editorial header */}
      <div className="border-b border-border bg-background">
        <div className="container py-12 md:py-16">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-foreground" />
            <span className="font-accent text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              Collection
            </span>
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold md:text-6xl">
            Shop <span className="italic">All</span>
          </h1>
          <p className="mt-2 font-accent text-sm text-muted-foreground">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 border border-border px-4 py-2 font-accent text-xs font-medium transition-colors hover:border-foreground"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 bg-foreground px-3 py-2 font-accent text-xs text-background">
                Clear All <X size={12} />
              </button>
            )}
            {activeCategory && (
              <span className="border border-border px-3 py-2 font-accent text-xs font-medium">
                {categories.find((c) => c.slug === activeCategory)?.name}
                <button onClick={() => setFilter("category", "")} className="ml-2"><X size={10} /></button>
              </span>
            )}
            {activeBrand && (
              <span className="border border-border px-3 py-2 font-accent text-xs font-medium">
                {activeBrand}
                <button onClick={() => setFilter("brand", "")} className="ml-2"><X size={10} /></button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 md:flex">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 transition-colors ${gridCols === 3 ? "text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 transition-colors ${gridCols === 4 ? "text-foreground" : "text-muted-foreground"}`}
              >
                <Grid3X3 size={16} />
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border bg-background px-4 py-2 font-accent text-xs outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-8 border-b border-border py-6 md:grid-cols-2">
                <div>
                  <h3 className="font-accent text-xs font-semibold tracking-[0.2em] uppercase">Category</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setFilter("category", activeCategory === cat.slug ? "" : cat.slug)}
                        className={`px-3 py-1.5 font-accent text-xs font-medium transition-colors ${
                          activeCategory === cat.slug
                            ? "bg-foreground text-background"
                            : "border border-border hover:border-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-accent text-xs font-semibold tracking-[0.2em] uppercase">Brand</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setFilter("brand", activeBrand === brand ? "" : brand)}
                        className={`px-3 py-1.5 font-accent text-xs font-medium transition-colors ${
                          activeBrand === brand
                            ? "bg-foreground text-background"
                            : "border border-border hover:border-foreground"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products grid */}
        <div className={`mt-6 grid grid-cols-2 gap-3 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} lg:gap-4`}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-heading text-lg text-muted-foreground">No products found</p>
            <button onClick={clearFilters} className="btn-beauty mt-4 text-xs">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
