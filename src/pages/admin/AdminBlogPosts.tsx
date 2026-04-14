import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminBlogPosts = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "Skincare Tips", published: false });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", category: "Skincare Tips", published: false });
    setEditing(null);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        published: form.published,
      };
      if (editing) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success(editing ? "Post updated" : "Post created");
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("blog_posts").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (post: any) => {
    setEditing(post);
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content || "", category: post.category || "General", published: post.published });
    setDialogOpen(true);
  };

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">{posts.length} posts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:bg-primary">
              <Plus size={14} /> New Post
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Blog Post"}</DialogTitle></DialogHeader>
            <div className="mt-4 space-y-4">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} className={inputClass} />
              <input placeholder="slug-url" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={`${inputClass} font-mono text-xs`} />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
              <textarea placeholder="Excerpt (short summary)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
              <textarea placeholder="Full content (supports **bold** formatting)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className={`${inputClass} resize-y font-mono text-xs`} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                Publish immediately
              </label>
              <button onClick={() => saveMutation.mutate()} disabled={!form.title.trim() || saveMutation.isPending} className="w-full bg-foreground py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:bg-primary disabled:opacity-50">
                {saveMutation.isPending ? "Saving..." : editing ? "Update Post" : "Create Post"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : posts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-xs text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => togglePublish.mutate({ id: p.id, published: !p.published })}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                    >
                      {p.published ? <><Eye size={10} /> Published</> : <><EyeOff size={10} /> Draft</>}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary"><Edit2 size={14} /></button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">No blog posts yet</div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogPosts;
