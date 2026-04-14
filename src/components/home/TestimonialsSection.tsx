import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Amara O.",
    text: "My skin cleared up in just 3 weeks! The COSRX cleanser and Mixsoon essence combo is everything.",
    rating: 5,
    initials: "AO",
  },
  {
    name: "Chidinma E.",
    text: "Finally found a store with authentic Korean skincare products. Delivery was fast too!",
    rating: 5,
    initials: "CE",
  },
  {
    name: "Fatima A.",
    text: "Great prices and the Zaron eyeshadow palette is incredible quality. Will definitely order again.",
    rating: 5,
    initials: "FA",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <div className="editorial-line" />
              <span className="font-accent text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
                Reviews
              </span>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-5xl">
              What Customers <span className="italic">Say</span>
            </h2>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background p-8"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-foreground text-background font-accent text-xs font-bold">
                  {t.initials}
                </div>
                <span className="font-accent text-sm font-semibold">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
