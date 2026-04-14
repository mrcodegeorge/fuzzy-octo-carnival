import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, MapPin, Heart, LogOut, ChevronDown, ChevronUp, ShoppingBag, Star, Plus, Trash2, Edit, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/data/products";
import { useWishlistProducts } from "@/hooks/useWishlist";
import { toast } from "sonner";
import AddressForm from "@/components/account/AddressForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const AccountPage = () => {
  const { user, signOut, loading } = useAuth();
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses">("orders");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: orderItemsMap = {} } = useQuery({
    queryKey: ["order-items", user?.id],
    queryFn: async () => {
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length === 0) return {};
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      const map: Record<string, typeof data> = {};
      (data ?? []).forEach((item) => {
        if (!map[item.order_id]) map[item.order_id] = [];
        map[item.order_id]!.push(item);
      });
      return map;
    },
    enabled: orders.length > 0,
  });

  const { data: wishlistData = [] } = useWishlistProducts();

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      toast.success("Address deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const toggleOrder = (id: string) =>
    setExpandedOrder((prev) => (prev === id ? null : id));

  return (
    <div className="section-padding">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold">My Account</h1>

          {/* Profile card */}
          <div className="mt-8 glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  {profile?.full_name || "Beauty Lover"}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Package, label: "Orders", count: orders.length, tab: "orders" as const },
              { icon: Heart, label: "Wishlist", count: wishlistData.length, tab: "wishlist" as const },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className={`glass-card flex flex-col items-center gap-2 p-4 text-center transition-colors ${
                  activeTab === item.tab ? "ring-2 ring-primary" : ""
                }`}
              >
                <item.icon size={20} className={activeTab === item.tab ? "text-primary" : "text-primary/60"} />
                <span className="text-xs font-medium">{item.label}</span>
                <span className="text-lg font-bold">{item.count}</span>
              </button>
            ))}
            <button
              onClick={() => setActiveTab("addresses")}
              className={`glass-card flex flex-col items-center gap-2 p-4 text-center transition-colors ${
                activeTab === "addresses" ? "ring-2 ring-primary" : ""
              }`}
            >
              <MapPin size={20} className={activeTab === "addresses" ? "text-primary" : "text-primary/60"} />
              <span className="text-xs font-medium">Addresses</span>
              <span className="text-lg font-bold">{addresses.length}</span>
            </button>
            <button
              onClick={signOut}
              className="glass-card flex flex-col items-center gap-2 p-4 text-center text-destructive transition-colors hover:bg-destructive/5"
            >
              <LogOut size={20} />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          </div>

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="mt-10">
              <h2 className="font-heading text-xl font-bold">Order History</h2>
              {orders.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {orders.map((order) => {
                    const items = orderItemsMap[order.id] || [];
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <div key={order.id} className="glass-card overflow-hidden">
                        <button
                          onClick={() => toggleOrder(order.id)}
                          className="flex w-full items-center justify-between p-4"
                        >
                          <div className="text-left">
                            <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-GH", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatPrice(Number(order.total))}</p>
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                                statusColors[order.status] || "bg-muted text-muted-foreground"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                                {items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    {item.product_image && (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="h-12 w-12 rounded-lg object-cover"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold whitespace-nowrap">
                                      {formatPrice(Number(item.price) * item.quantity)}
                                    </p>
                                  </div>
                                ))}

                                <div className="border-t border-border pt-3 space-y-1 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(Number(order.subtotal))}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{Number(order.shipping_fee) === 0 ? "FREE" : formatPrice(Number(order.shipping_fee))}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-foreground">
                                    <span>Total</span>
                                    <span>{formatPrice(Number(order.total))}</span>
                                  </div>
                                  {order.payment_method && (
                                    <p className="pt-1">Payment: {order.payment_method}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border p-8 text-center">
                  <Package size={32} className="mx-auto text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No orders yet</p>
                  <Link to="/shop" className="btn-beauty mt-4 inline-block text-xs">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="mt-10">
              <h2 className="font-heading text-xl font-bold">My Wishlist</h2>
              {wishlistData.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {wishlistData.map((item: any) => {
                    const p = item.products;
                    if (!p) return null;
                    return (
                      <Link
                        key={item.product_id}
                        to={`/product/${p.id}`}
                        className="glass-card flex items-center gap-4 p-4 transition-colors hover:bg-accent/5"
                      >
                        <img
                          src={p.image_url || "/placeholder.svg"}
                          alt={p.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase">{p.brand}</p>
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="fill-gold text-gold" />
                            <span className="text-xs text-muted-foreground">{p.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold">{formatPrice(Number(p.price))}</p>
                          {p.original_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(Number(p.original_price))}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border p-8 text-center">
                  <Heart size={32} className="mx-auto text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No items in your wishlist</p>
                  <Link to="/shop" className="btn-beauty mt-4 inline-block text-xs">
                    Discover Products
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">My Addresses</h2>
                <button
                  onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus size={14} /> Add New
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="mt-4 grid gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="glass-card p-5 relative">
                      {addr.is_default && (
                        <span className="absolute right-5 top-5 bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      <div className="space-y-1 pr-16 text-sm">
                        <p className="font-bold">{addr.full_name}</p>
                        <p className="text-muted-foreground">{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-muted-foreground">{addr.address_line2}</p>}
                        <p className="text-muted-foreground">{addr.city}, {addr.region}</p>
                        <p className="text-muted-foreground flex items-center gap-1.5"><Phone size={12} /> {addr.phone}</p>
                      </div>
                      <div className="mt-4 flex gap-4 pt-4 border-t border-border/50">
                        <button
                          onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        {!addr.is_default && (
                          <button
                            onClick={() => deleteAddress.mutate(addr.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border p-8 text-center">
                  <MapPin size={32} className="mx-auto text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No saved addresses</p>
                  <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="btn-beauty mt-4 inline-block text-xs"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Address Form Dialog */}
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                Provide your delivery details for faster checkout.
              </DialogDescription>
            </DialogHeader>
            <AddressForm
              initialData={editingAddress}
              onSuccess={() => setIsAddressModalOpen(false)}
              onCancel={() => setIsAddressModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AccountPage;
