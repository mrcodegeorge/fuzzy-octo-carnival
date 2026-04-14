import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User } from "lucide-react";

const AdminCustomers = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">Customers</h2>
      <p className="text-sm text-muted-foreground">{profiles?.length || 0} registered customers</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : profiles && profiles.length > 0 ? (
          <div className="divide-y divide-border">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{p.phone || "No phone"}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No customers yet</div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
