import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";

const ShippingPolicyPage = () => {
  const { data: zones = [] } = useQuery({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="section-padding">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold md:text-5xl">Shipping & Returns</h1>
          <p className="mt-2 text-sm text-muted-foreground">How we get your beauty products to you</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12 space-y-10">
          <section>
            <h2 className="font-heading text-xl font-bold">Delivery Zones & Fees</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/40"><th className="px-5 py-3 text-left font-semibold">Zone</th><th className="px-5 py-3 text-right font-semibold">Fee</th></tr></thead>
                <tbody>
                  {zones.map((z) => (
                    <tr key={z.id} className="border-t border-border">
                      <td className="px-5 py-3">{z.zone_name}</td>
                      <td className="px-5 py-3 text-right font-medium">{formatPrice(Number(z.fee))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold">Processing Time</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">Orders are processed within 1–2 business days. You will receive a confirmation via WhatsApp once your order has been dispatched.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold">Delivery Timelines</h2>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" /> <span><strong className="text-foreground">Accra & Tema:</strong> 1–2 business days</span></li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" /> <span><strong className="text-foreground">Kumasi:</strong> 2–3 business days</span></li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" /> <span><strong className="text-foreground">Other Regions:</strong> 3–5 business days</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold">Returns & Exchanges</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">We accept returns on unopened, sealed products within 7 days of delivery. To initiate a return, contact us via WhatsApp or email with your order ID and reason for return. Refunds are processed within 3–5 business days after we receive the returned item.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold">Damaged Products</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">If you receive a damaged product, please contact us within 24 hours of delivery with photos. We will arrange a free replacement.</p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
