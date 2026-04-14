import { motion } from "framer-motion";
import { Sparkles, Truck, ShieldCheck, Heart, MessageCircle } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "100% Authentic", desc: "Every product is sourced directly from trusted brands and authorized distributors." },
  { icon: Sparkles, title: "Curated K-Beauty", desc: "Hand-picked Korean beauty products that deliver real results for every skin type." },
  { icon: Truck, title: "Fast Delivery", desc: "Reliable nationwide delivery across Ghana — from Accra to your doorstep." },
  { icon: MessageCircle, title: "Expert Guidance", desc: "Personalized skincare advice from our team to help you find your perfect routine." },
  { icon: Heart, title: "Affordable Luxury", desc: "Premium beauty shouldn't break the bank. Competitive pricing on every product." },
];

const brands = [
  "COSRX", "TonyMoly", "Medicube", "Mixsoon", "Zaron",
  "Beauty of Joseon", "Some By Mi", "Anua", "Skin1004", "Round Lab",
];

const AboutPage = () => {
  return (
    <div className="section-padding">
      <div className="container max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="font-accent text-xs uppercase tracking-[0.3em] text-primary">Our Story</p>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight md:text-6xl">
            Beauty That Feels <br className="hidden md:block" />Like Home
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Tillies Avenue is a beauty destination providing authentic skincare, makeup, and beauty products —
            including premium Korean beauty brands and international cosmetics — delivered right across Ghana.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-16 rounded-3xl border border-border bg-card p-8 md:p-12 text-center"
        >
          <p className="font-accent text-xs uppercase tracking-[0.3em] text-primary">Our Mission</p>
          <p className="mt-4 font-heading text-xl font-semibold leading-relaxed md:text-2xl">
            To help everyone achieve healthy, glowing skin with trusted beauty products at accessible prices —
            backed by expert guidance and genuine care.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-16"
        >
          <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">Why Choose Us</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <v.icon size={20} />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Brands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="font-accent text-xs uppercase tracking-[0.3em] text-primary">Trusted Brands</p>
          <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl">Brands We Carry</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Each brand is carefully selected for quality, efficacy, and value — so you can shop with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {brands.map((b) => (
              <span
                key={b}
                className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {b}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 rounded-3xl bg-primary/5 border border-primary/20 p-8 md:p-12 text-center"
        >
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Ready to Glow?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Browse our curated collection of skincare, makeup, and beauty essentials.
          </p>
          <a
            href="/shop"
            className="mt-6 inline-block bg-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-primary"
          >
            Shop Now
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
