import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";
import { Loader2, Search, Filter, ChevronDown, ChevronUp, Package, Phone, MapPin, Download, RotateCcw, Mail } from "lucide-react";

const statusOptions = ["pending", "confirmed", "paid", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  paid: "bg-teal-100 text-teal-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refundingOrder, setRefundingOrder] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-map"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, phone");
      return data || [];
    },
  });

  const profileMap = useMemo(() => {
    const map: Record<string, { full_name: string | null; phone: string | null }> = {};
    profiles?.forEach((p) => { map[p.user_id] = p; });
    return map;
  }, [profiles]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] });
      toast.success("Order status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const processRefund = useMutation({
    mutationFn: async ({ orderId, amount }: { orderId: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke("process-refund", {
        body: { order_id: orderId, amount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] });
      toast.success(`Refund processed (${data.refund_status})`);
      setRefundingOrder(null);
      setRefundAmount("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sendEmail = useMutation({
    mutationFn: async ({ orderId, emailType }: { orderId: string; emailType: string }) => {
      const { data, error } = await supabase.functions.invoke("send-order-email", {
        body: { order_id: orderId, email_type: emailType },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Email sent");
      setSendingEmail(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (dateFilter !== "all") {
        const orderDate = new Date(o.created_at);
        const now = new Date();
        if (dateFilter === "today") {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < monthAgo) return false;
        }
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const profile = profileMap[o.user_id];
        const customerName = profile?.full_name?.toLowerCase() || "";
        const customerPhone = profile?.phone?.toLowerCase() || "";
        const orderId = o.id.toLowerCase();
        const paymentRef = (o.payment_reference || "").toLowerCase();
        if (!orderId.includes(q) && !customerName.includes(q) && !customerPhone.includes(q) && !paymentRef.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, search, profileMap]);

  const toggleExpand = (id: string) => setExpandedOrder((prev) => (prev === id ? null : id));

  const exportCSV = () => {
    const header = "Order ID,Customer,Phone,Status,Total,Payment,Date\n";
    const rows = filteredOrders.map((o) => {
      const p = profileMap[o.user_id];
      return `"${o.id.slice(0, 8)}","${p?.full_name || "Unknown"}","${p?.phone || "-"}","${o.status}",${o.total},"${o.payment_method || "-"}","${new Date(o.created_at).toLocaleDateString()}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-sm text-muted-foreground">{orders?.length || 0} total orders</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-muted/50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary cursor-pointer">
            <option value="all">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary cursor-pointer">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredOrders.length} of {orders?.length || 0} orders
      </p>

      <div className="overflow-hidden border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Customer</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const profile = profileMap[order.user_id];
                  const isExpanded = expandedOrder === order.id;
                  const shippingAddr = order.shipping_address as any;
                  const refundedAmount = Number((order as any).refunded_amount || 0);
                  const refundStatus = (order as any).refund_status;

                  return (
                    <>
                      <tr key={order.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleExpand(order.id)}>
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs font-semibold">#{order.id.slice(0, 8)}</p>
                          {refundStatus && <span className="text-[9px] uppercase font-bold text-orange-600">Refund: {refundStatus}</span>}
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <p className="text-sm font-medium">{profile?.full_name || shippingAddr?.full_name || "—"}</p>
                          <p className="text-[10px] text-muted-foreground">{profile?.phone || shippingAddr?.phone || ""}</p>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-bold">{formatPrice(Number(order.total))}</td>
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                            className={`px-2.5 py-1 text-[11px] font-semibold capitalize border-0 outline-none cursor-pointer ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}
                          >
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${order.id}-detail`} className="bg-muted/10">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Package size={12} /> Items ({order.order_items?.length || 0})
                                </h4>
                                <div className="space-y-2">
                                  {(order.order_items || []).map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                      {item.product_image && <img src={item.product_image} alt="" className="h-8 w-8 object-cover" />}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{item.product_name}</p>
                                        <p className="text-[10px] text-muted-foreground">x{item.quantity} · {formatPrice(Number(item.price))}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {shippingAddr && (
                                <div>
                                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <MapPin size={12} /> Shipping
                                  </h4>
                                  <div className="text-xs space-y-0.5">
                                    <p className="font-medium">{shippingAddr.full_name}</p>
                                    <p className="text-muted-foreground">{shippingAddr.address_line1}</p>
                                    {shippingAddr.address_line2 && <p className="text-muted-foreground">{shippingAddr.address_line2}</p>}
                                    <p className="text-muted-foreground">{shippingAddr.city}, {shippingAddr.region}</p>
                                    <p className="flex items-center gap-1 text-muted-foreground"><Phone size={10} /> {shippingAddr.phone}</p>
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</h4>
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(Number(order.shipping_fee || 0))}</span></div>
                                  <div className="flex justify-between border-t border-border pt-1 font-bold"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
                                  {refundedAmount > 0 && (
                                    <div className="flex justify-between text-orange-600"><span>Refunded</span><span>-{formatPrice(refundedAmount)}</span></div>
                                  )}
                                  {order.payment_method && <p className="text-muted-foreground mt-1">Payment: {order.payment_method}</p>}
                                  {order.payment_reference && <p className="text-muted-foreground">Ref: {order.payment_reference}</p>}
                                </div>
                              </div>
                            </div>

                            {/* Actions Row */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                              {/* Refund Button */}
                              {order.payment_reference && refundStatus !== "full" && (
                                refundingOrder === order.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="Amount (GH₵)"
                                      value={refundAmount}
                                      onChange={(e) => setRefundAmount(e.target.value)}
                                      className="w-32 border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); processRefund.mutate({ orderId: order.id, amount: parseFloat(refundAmount) }); }}
                                      disabled={processRefund.isPending || !refundAmount || parseFloat(refundAmount) <= 0}
                                      className="flex items-center gap-1 bg-orange-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                                    >
                                      {processRefund.isPending ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                                      Confirm
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setRefundingOrder(null); }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setRefundingOrder(order.id); setRefundAmount(String(Number(order.total) - refundedAmount)); }}
                                    className="flex items-center gap-1.5 border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50"
                                  >
                                    <RotateCcw size={12} /> Refund
                                  </button>
                                )
                              )}

                              {/* Email Buttons */}
                              {sendingEmail === order.id ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {["order_confirmation", "payment_receipt", "shipping_update"].map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => sendEmail.mutate({ orderId: order.id, emailType: type })}
                                      disabled={sendEmail.isPending}
                                      className="border border-border px-2 py-1 text-[10px] font-medium uppercase hover:bg-muted/50 disabled:opacity-50"
                                    >
                                      {type.replace("_", " ")}
                                    </button>
                                  ))}
                                  <button onClick={() => setSendingEmail(null)} className="text-xs text-muted-foreground hover:text-foreground ml-1">✕</button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSendingEmail(order.id); }}
                                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                >
                                  <Mail size={12} /> Send Email
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {search || statusFilter !== "all" || dateFilter !== "all" ? "No orders match your filters" : "No orders yet"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
