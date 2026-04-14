import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AdminInventory = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "in-stock" | "out-of-stock" | "low-stock">("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, in_stock, image_url, category_slug, stock_quantity")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, stock_quantity, in_stock }: { id: string; stock_quantity: number; in_stock: boolean }) => {
      const { error } = await supabase.from("products").update({ stock_quantity, in_stock }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Stock updated");
    },
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const qty = p.stock_quantity ?? 0;
    if (filter === "in-stock") return matchSearch && p.in_stock !== false && qty > 0;
    if (filter === "out-of-stock") return matchSearch && (p.in_stock === false || qty === 0);
    if (filter === "low-stock") return matchSearch && qty > 0 && qty <= 5;
    return matchSearch;
  });

  const outOfStockCount = products.filter((p) => p.in_stock === false || (p.stock_quantity ?? 0) === 0).length;
  const inStockCount = products.filter((p) => p.in_stock !== false && (p.stock_quantity ?? 0) > 0).length;
  const lowStockCount = products.filter((p) => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Inventory Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage product stock levels</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 border border-border bg-card p-4">
          <Package className="text-primary" size={20} />
          <div>
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-3 border border-border bg-card p-4">
          <CheckCircle className="text-emerald-600" size={20} />
          <div>
            <p className="text-2xl font-bold">{inStockCount}</p>
            <p className="text-xs text-muted-foreground">In Stock</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="flex items-center gap-3 border border-border bg-card p-4">
          <AlertTriangle className="text-yellow-600" size={20} />
          <div>
            <p className="text-2xl font-bold">{lowStockCount}</p>
            <p className="text-xs text-muted-foreground">Low Stock (≤5)</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 border border-border bg-card p-4">
          <AlertTriangle className="text-red-600" size={20} />
          <div>
            <p className="text-2xl font-bold">{outOfStockCount}</p>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="flex border border-border">
          {(["all", "in-stock", "low-stock", "out-of-stock"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}>
              {f === "all" ? "All" : f === "in-stock" ? "In Stock" : f === "low-stock" ? "Low" : "Out"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((product, i) => {
          const qty = product.stock_quantity ?? 0;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 border border-border bg-card p-3">
              <div className="h-12 w-12 overflow-hidden bg-secondary">
                {product.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand} · {formatPrice(product.price)}</p>
              </div>
              <span className="text-xs text-muted-foreground">{product.category_slug}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 0;
                    updateStock.mutate({ id: product.id, stock_quantity: newQty, in_stock: newQty > 0 });
                  }}
                  className="w-16 border border-border bg-background px-2 py-1.5 text-center text-xs focus:border-primary focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  qty === 0 ? "bg-red-100 text-red-700" : qty <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {qty === 0 ? "Out" : qty <= 5 ? "Low" : "OK"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminInventory;
