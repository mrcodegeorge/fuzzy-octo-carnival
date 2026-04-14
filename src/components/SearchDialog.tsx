import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/data/products";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results = query.trim().length >= 2
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  const goToProduct = (id: string) => {
    onOpenChange(false);
    navigate(`/product/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%] translate-y-0 p-0 gap-0 max-w-lg">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={18} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {query.trim().length >= 2 && (
          <div className="max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="divide-y divide-border">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goToProduct(p.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.brand} · {p.category}</p>
                    </div>
                    <p className="text-sm font-bold whitespace-nowrap">{formatPrice(p.price)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No products found for "{query}"
              </div>
            )}
          </div>
        )}

        {query.trim().length < 2 && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            Type at least 2 characters to search
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
