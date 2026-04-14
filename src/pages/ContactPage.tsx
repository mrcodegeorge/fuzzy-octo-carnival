import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="section-padding">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-heading text-3xl font-bold md:text-5xl">Contact Us</h1>
          <p className="mt-2 text-sm text-muted-foreground">We'd love to hear from you</p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
              required
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-xl border border-border bg-background px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
              required
            />
            <button type="submit" className="btn-beauty w-full">Send Message</button>
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {[
              { icon: Mail, label: "Email", value: "hello@tilliesavenue.com", href: "mailto:hello@tilliesavenue.com" },
              { icon: Phone, label: "Phone", value: "+233 24 123 4567", href: "tel:+233241234567" },
              { icon: MapPin, label: "Location", value: "Accra, Ghana" },
            ].map((item) => (
              <div key={item.label} className="glass-card flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium hover:text-primary">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href="https://wa.me/233241234567"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-beauty flex w-full items-center justify-center gap-2"
              style={{ background: "hsl(142, 70%, 40%)" }}
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
