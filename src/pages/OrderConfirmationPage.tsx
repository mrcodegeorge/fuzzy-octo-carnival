import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/data/products";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state as {
    orderId: string;
    total: number;
    items: { name: string; quantity: number; price: number }[];
    address: { full_name: string; phone: string; city: string; region: string };
    paymentMethod: string;
  } | null;

  const { data: settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || "233241234567";

  if (!order) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <Package size={48} className="text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-xl font-bold">No order found</h2>
        <Link to="/shop" className="btn-beauty mt-6 text-xs">Continue Shopping</Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I just placed order #${order.orderId.slice(0, 8)} for ${formatPrice(order.total)}. Could you confirm it's been received?`
  );

  return (
    <div className="container max-w-2xl py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you, {order.address.full_name}. Your order has been received.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</p>
              <p className="font-mono text-sm font-bold">#{order.orderId.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="font-heading text-lg font-bold">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Payment</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery to</span>
              <span>{order.address.city}, {order.address.region}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/account" className="btn-beauty inline-flex items-center justify-center gap-2 text-sm">
            <Package size={16} /> View My Orders
          </Link>
          <Link to="/shop" className="btn-beauty-outline inline-flex items-center justify-center gap-2 text-sm">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-green-600 transition-colors"
          >
            <MessageCircle size={16} /> Need help? Chat with us on WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmationPage;
