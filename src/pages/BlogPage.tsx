import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPage = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="section-padding">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-heading text-3xl font-bold md:text-5xl">Beauty Blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tips, guides, and skincare wisdom</p>
        </motion.div>

        <div className="mt-12 space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 md:p-8 space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 transition-all hover:shadow-lg md:p-8"
              >
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary uppercase">
                  {post.category}
                </span>
                <h2 className="mt-3 font-heading text-xl font-bold">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-primary hover:underline">
                    Read More →
                  </Link>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground">No blog posts yet. Check back soon!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
