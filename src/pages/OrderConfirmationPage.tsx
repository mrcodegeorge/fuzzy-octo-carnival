import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, MessageCircle, Copy, Check, Sparkles, Truck, Box, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/data/products";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Confetti particle component
const ConfettiParticle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    className="pointer-events-none fixed top-0 z-50 h-2.5 w-1.5 rounded-sm"
    style={{ left: `${x}%`, backgroundColor: color }}
    initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
    animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 720, scale: [1, 1, 0.3] }}
    transition={{ duration: 2.5 + Math.random() * 1.5, delay, ease: "easeIn" }}
  />
);

const CONFETTI_COLORS = ["#C9A96E", "#E8D5B0", "#8B6914", "#F4E9D0", "#D4B483", "#2D1B00"];
const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  delay: Math.random() * 1.2,
  x: Math.random() * 100,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
}));

const timelineSteps = [
  { icon: Check, label: "Order Placed", desc: "We've received your order" },
  { icon: Box, label: "Processing", desc: "Preparing your items" },
  { icon: Truck, label: "Shipped", desc: "On its way to you" },
  { icon: MapPin, label: "Delivered", desc: "Enjoy your purchase!" },
];

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state as {
    orderId: string;
    total: number;
    items: { name: string; quantity: number; price: number; image?: string }[];
    address: { full_name: string; phone: string; city: string; region: string };
    paymentMethod: string;
  } | null;

  const { data: settings } = useStoreSettings();
  const { data: products = [] } = useProducts();
  const whatsappNumber = settings?.whatsapp_number || "233241234567";
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!order) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <Package size={48} className="text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-xl font-bold">No order found</h2>
        <Link to="/shop" className="btn-beauty mt-6 text-xs">Continue Shopping</Link>
      </div>
    );
  }

  const shortId = order.orderId.slice(0, 8).toUpperCase();

  const whatsappMessage = encodeURIComponent(
    `Hi! I just placed order #${shortId} for ${formatPrice(order.total)} on Tillies Avenue. Could you confirm it's been received? 🛍️`
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(`#${shortId}`);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Pick up to 4 recommendations from same-category products, avoiding ordered items
  const orderedNames = new Set(order.items.map((i) => i.name));
  const recommendations = products
    .filter((p) => !orderedNames.has(p.name))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Confetti */}
      {showConfetti && confettiPieces.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}

      <div className="container max-w-3xl py-12 md:py-20">
        {/* Hero Success Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-lg ring-4 ring-amber-200/50 dark:from-amber-950/50 dark:to-amber-900/30 dark:ring-amber-800/30"
          >
            <CheckCircle2 size={44} className="text-amber-600 dark:text-amber-400" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="mt-6 font-heading text-3xl font-bold md:text-4xl">
              Order Confirmed! 🎉
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you, <span className="font-semibold text-foreground">{order.address.full_name}</span>. Your order is on its way.
            </p>
          </motion.div>
        </motion.div>

        {/* Order ID Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Order Reference</p>
            <p className="mt-0.5 font-mono text-xl font-bold text-foreground">#{shortId}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</p>
              <p className="mt-0.5 font-heading text-xl font-bold text-primary">{formatPrice(order.total)}</p>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium transition-all hover:border-primary hover:text-primary"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy ID"}
            </button>
          </div>
        </motion.div>

        {/* Delivery Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Delivery Progress</h2>
          <div className="mt-5 flex items-start justify-between gap-2">
            {timelineSteps.map((step, idx) => {
              const isActive = idx === 0;
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-1 flex-col items-center text-center">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <Icon size={16} />
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className="absolute top-5 left-1/2 h-0.5 w-full bg-border" />
                  )}
                  <p className={`mt-2 text-[11px] font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-5 rounded-2xl border border-border bg-card"
        >
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-sm font-semibold">Order Summary ({order.items.length} item{order.items.length > 1 ? "s" : ""})</h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-muted/30 px-5 py-3 text-right">
            <p className="text-xs text-muted-foreground">
              Delivered to: <span className="font-medium text-foreground">{order.address.city}, {order.address.region}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Payment: <span className="font-medium text-foreground">{order.paymentMethod?.split("(")[0].trim()}</span>
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          <Link to="/account" className="btn-beauty inline-flex items-center justify-center gap-2 text-sm">
            <Package size={16} /> Track My Order
          </Link>
          <Link to="/shop" className="btn-beauty-outline inline-flex items-center justify-center gap-2 text-sm">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* WhatsApp Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-5 flex items-center justify-center gap-4"
        >
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all hover:border-green-500 hover:text-green-600"
          >
            <MessageCircle size={15} />
            Chat with us on WhatsApp
          </a>
        </motion.div>

        {/* AI Recommendations Teaser */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25 }}
            className="mt-16"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles size={14} className="text-primary" />
                You May Also Love
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
