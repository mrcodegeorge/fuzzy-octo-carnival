import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight, Percent, DollarSign, Search, Calendar } from "lucide-react";
import { toast } from "sonner";

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("coupons").insert({
        code: code.toUpperCase().trim(),
        description,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: minOrder ? parseFloat(minOrder) : 0,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated");
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setCode("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrder("");
    setMaxUses("");
    setExpiresAt("");
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Coupons & Discounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{coupons.length} total coupons</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition-colors hover:bg-primary"
        >
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold">Create Coupon</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Code *</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SAVE20"
                    className="mt-1 w-full border border-border px-4 py-2.5 text-sm uppercase focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="20% off all orders"
                    className="mt-1 w-full border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Discount Type</label>
                  <div className="mt-1 flex border border-border">
                    <button
                      onClick={() => setDiscountType("percentage")}
                      className={`flex-1 py-2.5 text-xs font-medium ${discountType === "percentage" ? "bg-foreground text-background" : ""}`}
                    >
                      <Percent size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => setDiscountType("fixed")}
                      className={`flex-1 py-2.5 text-xs font-medium ${discountType === "fixed" ? "bg-foreground text-background" : ""}`}
                    >
                      GH₵
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Discount Value * {discountType === "percentage" ? "(%)" : "(GH₵)"}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="mt-1 w-full border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Min Order (GH₵)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Max Uses</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className="mt-1 w-full border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expires At</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 w-full border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => createCoupon.mutate()}
                  disabled={!code || !discountValue}
                  className="bg-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-40"
                >
                  Create
                </button>
                <button onClick={resetForm} className="px-6 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupons..."
          className="w-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Coupons List */}
      <div className="space-y-2">
        {filtered.map((coupon, i) => {
          const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
          const isMaxed = coupon.max_uses && coupon.used_count >= coupon.max_uses;

          return (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 border border-border bg-card p-4 ${
                !coupon.is_active || isExpired || isMaxed ? "opacity-60" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                <Tag size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-wider">{coupon.code}</span>
                  {isExpired && <span className="text-[10px] font-medium uppercase text-red-500">Expired</span>}
                  {isMaxed && <span className="text-[10px] font-medium uppercase text-amber-500">Maxed</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}% off`
                    : `GH₵${coupon.discount_value} off`}
                  {coupon.min_order_amount > 0 && ` · Min order GH₵${coupon.min_order_amount}`}
                  {coupon.description && ` · ${coupon.description}`}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ""} uses</p>
                {coupon.expires_at && (
                  <p className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(coupon.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleActive.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                className="text-muted-foreground hover:text-foreground"
              >
                {coupon.is_active ? <ToggleRight size={22} className="text-primary" /> : <ToggleLeft size={22} />}
              </button>
              <button
                onClick={() => { if (confirm("Delete this coupon?")) deleteCoupon.mutate(coupon.id); }}
                className="text-muted-foreground hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          );
        })}
        {filtered.length === 0 && !isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">No coupons found</div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
