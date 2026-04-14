import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPostPage = () => {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-12">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-4 w-40" />
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <h2 className="font-heading text-xl font-bold">Post not found</h2>
        <Link to="/blog" className="btn-beauty mt-6 text-xs">Back to Blog</Link>
      </div>
    );
  }

  // Simple markdown-like rendering: bold, paragraphs, lists
  const renderContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((p, i) => {
      // Handle headers
      if (p.startsWith("**") && p.endsWith("**")) {
        return <h3 key={i} className="mt-6 mb-3 font-heading text-lg font-bold">{p.replace(/\*\*/g, "")}</h3>;
      }

      // Handle list items
      if (p.includes("\n- ") || p.startsWith("- ")) {
        const lines = p.split("\n");
        const title = lines[0].startsWith("- ") ? null : lines[0];
        const items = lines.filter(l => l.startsWith("- "));
        return (
          <div key={i} className="mt-4">
            {title && <p className="mb-2 font-medium" dangerouslySetInnerHTML={{ __html: title.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
            <ul className="space-y-1.5 pl-4">
              {items.map((item, j) => (
                <li key={j} className="list-disc text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: item.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
              ))}
            </ul>
          </div>
        );
      }

      // Handle numbered lists
      if (/^\d+\./.test(p.trim())) {
        const items = p.split("\n").filter(l => l.trim());
        return (
          <ol key={i} className="mt-4 space-y-2 pl-4">
            {items.map((item, j) => (
              <li key={j} className="list-decimal text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
            ))}
          </ol>
        );
      }

      return (
        <p key={i} className="mt-4 leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
      );
    });
  };

  return (
    <div className="section-padding">
      <div className="container max-w-3xl">
        <Link to="/blog" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary uppercase">
            {post.category}
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User size={14} /> {post.author_name}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} className="mt-8 w-full rounded-2xl object-cover aspect-[2/1]" />
          )}

          <div className="mt-8 text-base">
            {post.content ? renderContent(post.content) : <p className="text-muted-foreground">{post.excerpt}</p>}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default BlogPostPage;
