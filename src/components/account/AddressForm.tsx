import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Home, MapPin, Phone, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Address = {
  id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  is_default: boolean;
};

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern", "Western", 
  "Northern", "Upper East", "Upper West", "Volta", "Bono", 
  "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
];

const AddressForm = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}: { 
  initialData?: Address, 
  onSuccess: () => void, 
  onCancel: () => void 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Address>(initialData || {
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    region: "Greater Accra",
    is_default: false,
  });

  const saveAddress = useMutation({
    mutationFn: async (data: Address) => {
      if (!user) throw new Error("Not authenticated");
      
      const payload = { ...data, user_id: user.id };
      
      if (data.id) {
        const { error } = await supabase
          .from("addresses")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast.success(formData.id ? "Address updated" : "Address saved");
      onSuccess();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address_line1 || !formData.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    saveAddress.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <UserIcon size={12} /> Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Recipient Name"
            className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Phone size={12} /> Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="024 123 4567"
            className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MapPin size={12} /> Address Line 1 *
        </label>
        <input
          type="text"
          required
          value={formData.address_line1}
          onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
          placeholder="House/Apartment, Street Name"
          className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          value={formData.address_line2}
          onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
          placeholder="Building name, landmark, etc."
          className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Home size={12} /> City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g. Accra"
            className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Region *
          </label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="is_default"
          checked={formData.is_default}
          onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        <label htmlFor="is_default" className="text-xs font-medium cursor-pointer">
          Set as default delivery address
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saveAddress.isPending}
          className="bg-primary px-8 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {saveAddress.isPending && <Loader2 size={14} className="animate-spin" />}
          {formData.id ? "Update Address" : "Save Address"}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
