import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, MapPin } from "lucide-react";

const ghanaRegions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Volta", "Upper East", "Upper West", "Bono",
  "Bono East", "Ahafo", "Western North", "Oti", "Savannah", "North East",
];

const AdminDeliveryZones = () => {
  const queryClient = useQueryClient();
  const [newZone, setNewZone] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["admin-delivery-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addZone = useMutation({
    mutationFn: async () => {
      if (!newZone.trim() || !newFee) return;
      const { error } = await supabase.from("delivery_zones").insert({
        zone_name: newZone.trim(),
        fee: Number(newFee),
        region: newRegion || null,
        sort_order: zones.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      setNewZone("");
      setNewFee("");
      setNewRegion("");
      toast.success("Zone added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateFee = useMutation({
    mutationFn: async ({ id, fee }: { id: string; fee: number }) => {
      const { error } = await supabase.from("delivery_zones").update({ fee }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("Fee updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRegion = useMutation({
    mutationFn: async ({ id, region }: { id: string; region: string }) => {
      const { error } = await supabase.from("delivery_zones").update({ region: region || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("Region updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("delivery_zones").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("Zone deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">Delivery Zones</h2>
        <p className="text-sm text-muted-foreground">Set shipping fees per region. The fee is auto-applied at checkout based on the customer's selected region.</p>
      </div>

      {/* Add new zone */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-5">
        <input
          placeholder="Zone name (e.g. Accra Metro)"
          value={newZone}
          onChange={(e) => setNewZone(e.target.value)}
          className="flex-1 min-w-[180px] rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={newRegion}
          onChange={(e) => setNewRegion(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">— Map to region —</option>
          {ghanaRegions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">GH₵</span>
          <input
            type="number"
            placeholder="Fee"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            className="w-28 rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => addZone.mutate()}
          disabled={!newZone.trim() || !newFee}
          className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:bg-primary disabled:opacity-50"
        >
          <Plus size={14} /> Add Zone
        </button>
      </div>

      {/* Zones list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Zone</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mapped Region</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Fee (GH₵)</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <span className="font-medium">{z.zone_name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      defaultValue={(z as any).region || ""}
                      onChange={(e) => updateRegion.mutate({ id: z.id, region: e.target.value })}
                      className="rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                    >
                      <option value="">— None —</option>
                      {ghanaRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <input
                      type="number"
                      defaultValue={Number(z.fee)}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== Number(z.fee)) updateFee.mutate({ id: z.id, fee: val });
                      }}
                      className="w-20 rounded border border-border bg-background px-2 py-1 text-right text-sm outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleActive.mutate({ id: z.id, is_active: !z.is_active })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${z.is_active ? "bg-primary" : "bg-border"}`}
                    >
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${z.is_active ? "translate-x-5" : ""}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => deleteZone.mutate(z.id)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDeliveryZones;
