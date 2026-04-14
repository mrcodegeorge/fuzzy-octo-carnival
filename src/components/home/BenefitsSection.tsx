import { ShieldCheck, Truck, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: ShieldCheck, title: "Authentic Products", desc: "100% genuine from trusted brands", num: "01" },
  { icon: Truck, title: "Fast Delivery", desc: "Quick shipping across Ghana", num: "02" },
  { icon: Tag, title: "Affordable Prices", desc: "Premium beauty, fair prices", num: "03" },
  { icon: Sparkles, title: "Skincare Experts", desc: "Expert-curated routines", num: "04" },
];

const BenefitsSection = () => {
  return (
    <section className="section-padding border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-background p-6 md:p-8"
            >
              <span className="font-accent text-xs text-muted-foreground">{b.num}</span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center border border-border transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                <b.icon size={20} />
              </div>
              <h3 className="mt-4 font-accent text-sm font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
