import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="border-t border-border bg-foreground text-background">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="font-accent text-xs font-medium tracking-[0.3em] uppercase opacity-50">
            Stay Connected
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold md:text-5xl">
            Join the <span className="italic">Glow</span> Club
          </h2>
          <p className="mt-3 font-accent text-sm opacity-60">
            Get beauty tips, exclusive deals, and new arrival alerts.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
            className="mt-8 flex gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 border border-background/20 bg-transparent px-5 py-3.5 font-accent text-sm text-background placeholder:text-background/40 outline-none transition-colors focus:border-background/50"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary px-6 py-3.5 font-accent text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
