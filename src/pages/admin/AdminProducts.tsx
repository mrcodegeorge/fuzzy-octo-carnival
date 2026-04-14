import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  brand: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  price: string;
  original_price: string;
  category_slug: string;
  subcategory: string;
  image_url: string;
  in_stock: boolean;
  badges: string;
  skin_type: string;
  stock_quantity: string;
}

const emptyForm: ProductForm = {
  name: "", brand: "", description: "", ingredients: "", how_to_use: "",
  price: "", original_price: "", category_slug: "", subcategory: "",
  image_url: "", in_stock: true, badges: "", skin_type: "", stock_quantity: "0",
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        brand: form.brand,
        description: form.description || null,
        ingredients: form.ingredients || null,
        how_to_use: form.how_to_use || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category_slug: form.category_slug || null,
        subcategory: form.subcategory || null,
        image_url: form.image_url || null,
        in_stock: form.in_stock,
        badges: form.badges ? form.badges.split(",").map((b) => b.trim()) : null,
        skin_type: form.skin_type ? form.skin_type.split(",").map((s) => s.trim()) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      };

      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingId ? "Product updated!" : "Product added!");
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (product: NonNullable<typeof products>[0]) => {
    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description || "",
      ingredients: product.ingredients || "",
      how_to_use: product.how_to_use || "",
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : "",
      category_slug: product.category_slug || "",
      subcategory: product.subcategory || "",
      image_url: product.image_url || "",
      in_stock: product.in_stock ?? true,
      badges: (product.badges || []).join(", "),
      skin_type: (product.skin_type || []).join(", "),
      stock_quantity: String(product.stock_quantity ?? 0),
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const updateField = (field: keyof ProductForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">{products?.length || 0} products</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-beauty flex items-center gap-2 text-xs"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold">
              {editingId ? "Edit Product" : "New Product"}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Product Name *" value={form.name} onChange={(e) => updateField("name", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" required />
            <input placeholder="Brand *" value={form.brand} onChange={(e) => updateField("brand", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" required />
            <input placeholder="Price (GH₵) *" type="number" step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" required />
            <input placeholder="Original Price (GH₵)" type="number" step="0.01" value={form.original_price} onChange={(e) => updateField("original_price", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <select value={form.category_slug} onChange={(e) => updateField("category_slug", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
              <option value="">Select Category</option>
              {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <input placeholder="Subcategory" value={form.subcategory} onChange={(e) => updateField("subcategory", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <ImageUpload value={form.image_url} onChange={(url) => updateField("image_url", url)} />
            <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary md:col-span-2 resize-none" />
            <input placeholder="Ingredients (optional)" value={form.ingredients} onChange={(e) => updateField("ingredients", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary md:col-span-2" />
            <input placeholder="How to Use (optional)" value={form.how_to_use} onChange={(e) => updateField("how_to_use", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary md:col-span-2" />
            <input placeholder="Badges (comma separated)" value={form.badges} onChange={(e) => updateField("badges", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input placeholder="Skin Types (comma separated)" value={form.skin_type} onChange={(e) => updateField("skin_type", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => updateField("in_stock", e.target.checked)}
                className="rounded" />
              In Stock
            </label>
            <input placeholder="Stock Quantity" type="number" min="0" value={form.stock_quantity} onChange={(e) => updateField("stock_quantity", e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.brand || !form.price}
              className="btn-beauty flex items-center gap-2 text-xs disabled:opacity-50">
              {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Update Product" : "Add Product"}
            </button>
            <button onClick={resetForm} className="btn-beauty-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Brand</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url && <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground capitalize">{p.category_slug?.replace("-", " ")}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(Number(p.price))}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.in_stock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(p.id); }}
                          className="p-1.5 text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No products yet. Add your first product above.</div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
