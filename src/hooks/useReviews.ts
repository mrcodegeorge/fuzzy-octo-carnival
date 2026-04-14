import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: { full_name: string | null };
}

export const useReviews = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*, profiles!product_reviews_user_id_fkey(full_name)")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      if (error) {
        // Fallback without join if FK doesn't exist
        const { data: fallback, error: fallbackError } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("product_id", productId!)
          .order("created_at", { ascending: false });
        if (fallbackError) throw fallbackError;
        return (fallback ?? []) as Review[];
      }
      return (data ?? []).map((r: any) => ({
        ...r,
        profile: r.profiles,
      })) as Review[];
    },
    enabled: !!productId,
  });
};

export const useSubmitReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) => {
      if (!user) throw new Error("Sign in to leave a review");
      const { error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment || null,
        });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
      toast.success("Review submitted! ⭐");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};
