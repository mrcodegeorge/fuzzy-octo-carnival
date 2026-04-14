import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { getReferralSource } from "@/hooks/useReferral";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { toast } from "sonner";
import { Loader2, MapPin, CreditCard, Truck, ChevronLeft, ShieldCheck, Tag, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ghanaRegions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Volta", "Upper East", "Upper West", "Bono",
  "Bono East", "Ahafo", "Western North", "Oti", "Savannah", "North East",
];

interface AppliedCoupon {
  code: string;
  discount_type: string;
  discount_value: number;
}

const CheckoutPage = () => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { data: settings } = useStoreSettings();

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"shipping" | "confirm">("shipping");
  const [notes, setNotes] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [address, setAddress] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    region: "Greater Accra",
  });

  // Fetch delivery zones
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

  // Auto-match zone based on region
  const matchedZone = zones.find((z: any) => z.region === address.region);
  const shippingFee = matchedZone ? Number(matchedZone.fee) : 0;
  const hasZoneMatch = !!matchedZone;

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.round(totalPrice * appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value * 100
    : 0;

  const orderTotal = totalPrice - discount + shippingFee;

  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <ShieldCheck size={48} className="text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-xl font-bold">Sign in to checkout</h2>
        <p className="mt-2 text-sm text-muted-foreground">You need an account to place an order</p>
        <Link to="/auth" className="btn-beauty mt-6 text-xs">Sign In / Sign Up</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <Truck size={48} className="text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Add some products before checking out</p>
        <Link to="/shop" className="btn-beauty mt-6 text-xs">Browse Products</Link>
      </div>
    );
  }

  const updateAddress = (field: string, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  const validateShipping = () => {
    if (!address.full_name.trim() || !address.phone.trim() || !address.address_line1.trim() || !address.city.trim()) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!/^0[235]\d{8}$/.test(address.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid Ghana phone number (e.g. 0241234567)");
      return false;
    }
    if (!hasZoneMatch) {
      toast.error("Delivery is not available for your region yet");
      return false;
    }
    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .single();
      if (error || !data) { toast.error("Invalid or expired coupon code"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("This coupon has expired"); return; }
      if (data.max_uses && (data.used_count || 0) >= data.max_uses) { toast.error("This coupon has reached its usage limit"); return; }
      const minAmount = data.min_order_amount ? Number(data.min_order_amount) : 0;
      if (totalPrice < minAmount) { toast.error(`Minimum order of ${formatPrice(minAmount)} required`); return; }
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: Number(data.discount_value) });
      toast.success(`Coupon "${data.code}" applied!`);
    } catch { toast.error("Failed to apply coupon"); } finally { setApplyingCoupon(false); }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); };

  const saveOrderAndRedirect = async (paymentRef: string | null, paymentMethodLabel: string, status: string = "pending") => {
    const referralSource = getReferralSource();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        total: orderTotal,
        status,
        payment_method: paymentMethodLabel,
        payment_reference: paymentRef,
        shipping_address: { ...address, delivery_zone: matchedZone?.zone_name } as any,
        notes: appliedCoupon ? `${notes || ""} [Coupon: ${appliedCoupon.code}]`.trim() : (notes || null),
        referral_source: referralSource,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    clearCart();

    navigate("/order-confirmation", {
      state: {
        orderId: order.id,
        total: orderTotal,
        items: items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
        address,
        paymentMethod: paymentMethodLabel,
      },
    });
  };

  const handlePaystack = () => {
    const publicKey = settings?.paystack_public_key;
    if (!publicKey) {
      toast.error("Online payment is not configured yet. Please contact support.");
      return;
    }
    if (!validateShipping()) return;
    setSubmitting(true);

    try {
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) {
        toast.error("Payment system is loading. Please try again.");
        setSubmitting(false);
        return;
      }

      const handler = PaystackPop.setup({
        key: publicKey,
        email: user!.email,
        amount: Math.round(orderTotal * 100),
        currency: "GHS",
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: address.full_name },
            { display_name: "Phone", variable_name: "phone", value: address.phone },
          ],
        },
        callback: async (response: any) => {
          try {
            await saveOrderAndRedirect(response.reference, `Paystack (${response.reference})`, "paid");
          } catch (err: any) {
            toast.error(err.message || "Failed to save order");
          } finally {
            setSubmitting(false);
          }
        },
        onClose: () => {
          setSubmitting(false);
          toast.info("Payment cancelled");
        },
      });
      handler.openIframe();
    } catch (err: any) {
      toast.error("Failed to initialize payment");
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary transition-colors";

  return (
    <div className="container py-8 md:py-12">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft size={16} /> Continue Shopping
      </Link>

      <h1 className="font-heading text-2xl font-bold md:text-3xl">Checkout</h1>

      {/* Steps indicator */}
      <div className="mt-6 flex items-center gap-2 text-xs font-medium">
        {["shipping", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-6 bg-border" />}
            <button
              onClick={() => {
                if (s === "shipping") setStep("shipping");
                if (s === "confirm" && validateShipping()) setStep("confirm");
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === s ? "bg-primary text-primary-foreground"
                  : ["shipping", "confirm"].indexOf(step) > i ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >{i + 1}</button>
            <span className={`hidden sm:block capitalize ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === "confirm" ? "Review & Pay" : s}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {step === "shipping" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={18} className="text-primary" />
                <h2 className="font-heading text-lg font-semibold">Delivery Address</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input placeholder="Full Name *" value={address.full_name} onChange={(e) => updateAddress("full_name", e.target.value)} className={inputClass} />
                <input placeholder="Phone (e.g. 0241234567) *" value={address.phone} onChange={(e) => updateAddress("phone", e.target.value)} className={inputClass} />
                <input placeholder="Address Line 1 *" value={address.address_line1} onChange={(e) => updateAddress("address_line1", e.target.value)} className={`${inputClass} sm:col-span-2`} />
                <input placeholder="Address Line 2 (Landmark)" value={address.address_line2} onChange={(e) => updateAddress("address_line2", e.target.value)} className={`${inputClass} sm:col-span-2`} />
                <input placeholder="City / Town *" value={address.city} onChange={(e) => updateAddress("city", e.target.value)} className={inputClass} />
                <select value={address.region} onChange={(e) => updateAddress("region", e.target.value)} className={inputClass}>
                  {ghanaRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Auto-matched delivery zone info */}
              <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Truck size={16} className="text-primary" />
                  <span className="font-medium">Delivery Fee</span>
                </div>
                {hasZoneMatch ? (
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground">{matchedZone.zone_name} ({address.region})</span>
                    {" — "}
                    <span className="font-bold text-primary">{formatPrice(shippingFee)}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-destructive">
                    Delivery is not yet available for {address.region}. Please contact support.
                  </p>
                )}
              </div>

              {/* Order Notes */}
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium">Order Notes (optional)</label>
                <textarea placeholder="Any special instructions for delivery..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
              </div>

              <button onClick={() => { if (validateShipping()) setStep("confirm"); }} className="btn-beauty mt-6 w-full text-sm">
                Review & Pay
              </button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-primary" /><h3 className="text-sm font-semibold">Delivery Address</h3></div>
                  <button onClick={() => setStep("shipping")} className="text-xs text-primary hover:underline">Edit</button>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{address.full_name}</p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.region}</p>
                  <p>{address.phone}</p>
                  {matchedZone && <p className="mt-1 text-primary font-medium">Zone: {matchedZone.zone_name} — {formatPrice(shippingFee)}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold">Payment via Paystack</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">You'll be prompted to pay securely with Card or Mobile Money via Paystack.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("shipping")} className="btn-beauty-outline flex-1 text-sm">Back</button>
                <button onClick={handlePaystack} disabled={submitting} className="btn-beauty flex flex-1 items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Pay {formatPrice(orderTotal)}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">Order Summary</h3>
            <div className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-4 border-t border-border pt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-accent/30 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-primary" />
                    <span className="text-sm font-medium">{appliedCoupon.code}</span>
                    <span className="text-xs text-muted-foreground">
                      (-{appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : formatPrice(appliedCoupon.discount_value * 100)})
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} />
                  <button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode.trim()} className="rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background transition-colors hover:bg-primary disabled:opacity-50">
                    {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-primary"><span>Discount</span><span>-{formatPrice(discount)}</span></div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping {matchedZone ? `(${matchedZone.zone_name})` : ""}</span>
                <span>{hasZoneMatch ? formatPrice(shippingFee) : "—"}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-heading text-base font-bold">
                <span>Total</span><span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
