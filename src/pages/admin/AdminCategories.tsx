import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", sort_order: "0" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        icon: form.icon || null,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(editingId ? "Category updated!" : "Category added!");
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({ name: "", slug: "", icon: "", sort_order: "0" });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Categories</h2>
          <p className="text-sm text-muted-foreground">{categories?.length || 0} categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-beauty flex items-center gap-2 text-xs">
          <Plus size={14} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold">{editingId ? "Edit Category" : "New Category"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input placeholder="Slug *" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input placeholder="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.slug}
              className="btn-beauty text-xs disabled:opacity-50">
              {saveMutation.isPending && <Loader2 size={14} className="animate-spin mr-1" />}
              {editingId ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="btn-beauty-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : categories && categories.length > 0 ? (
          <div className="divide-y divide-border">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setForm({ name: c.name, slug: c.slug, icon: c.icon || "", sort_order: String(c.sort_order || 0) }); setEditingId(c.id); setShowForm(true); }}
                    className="p-1.5 text-muted-foreground hover:text-primary"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm("Delete this category?")) deleteMutation.mutate(c.id); }}
                    className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No categories yet</div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
