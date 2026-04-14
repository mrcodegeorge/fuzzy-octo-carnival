import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";

const mapDbProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  price: p.price,
  originalPrice: p.original_price ?? undefined,
  image: p.image_url ?? "/placeholder.svg",
  category: p.category_slug ?? "",
  subcategory: p.subcategory ?? undefined,
  rating: p.rating ?? 0,
  reviews: p.reviews_count ?? 0,
  description: p.description ?? "",
  ingredients: p.ingredients ?? undefined,
  howToUse: p.how_to_use ?? undefined,
  skinType: p.skin_type ?? undefined,
  badges: p.badges ?? undefined,
  inStock: p.in_stock ?? true,
});

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapDbProduct);
    },
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data) : null;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c) => ({
        name: c.name,
        icon: c.icon ?? "",
        slug: c.slug,
      }));
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("brand");
      if (error) throw error;
      const unique = [...new Set((data ?? []).map((p) => p.brand))];
      return unique.sort();
    },
  });
};
