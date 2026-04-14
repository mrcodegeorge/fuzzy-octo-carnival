import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import {
  Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, Truck, XCircle, Globe, DollarSign, Bell, X,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const PIE_COLORS = [
  "hsl(346, 60%, 45%)", "hsl(35, 70%, 50%)", "hsl(210, 60%, 50%)",
  "hsl(150, 50%, 45%)", "hsl(280, 50%, 55%)", "hsl(0, 60%, 55%)",
];

interface RealtimeNotification {
  id: string;
  orderId: string;
  total: number;
  status: string;
  timestamp: Date;
}

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  // Realtime subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;
          const notification: RealtimeNotification = {
            id: crypto.randomUUID(),
            orderId: newOrder.id,
            total: Number(newOrder.total),
            status: newOrder.status,
            timestamp: new Date(),
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 10));
          toast.success(`New order received! #${newOrder.id.slice(0, 8)} — ${formatPrice(Number(newOrder.total))}`);
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products-count"] });
          queryClient.invalidateQueries({ queryKey: ["admin-customers-count"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const { data: products } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["admin-customers-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, image_url, in_stock").eq("in_stock", false);
      return data || [];
    },
  });

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const revenueByDay = (() => {
    if (!orders?.length) return [];
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-GB", { weekday: "short" });
      days[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const key = d.toLocaleDateString("en-GB", { weekday: "short" });
        if (key in days) days[key] += Number(o.total);
      }
    });
    return Object.entries(days).map(([day, revenue]) => ({ day, revenue: revenue / 100 }));
  })();

  const ordersByStatus = (() => {
    if (!orders?.length) return [];
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const referralData = (() => {
    if (!orders?.length) return [];
    const sources: Record<string, number> = {};
    orders.forEach((o) => {
      const src = o.referral_source || "Direct";
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.entries(sources).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  })();

  const topProducts = (() => {
    if (!orders?.length) return [];
    const productSales: Record<string, { name: string; image: string | null; qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      (o.order_items || []).forEach((item: any) => {
        const key = item.product_id || item.product_name;
        if (!productSales[key]) {
          productSales[key] = { name: item.product_name, image: item.product_image, qty: 0, revenue: 0 };
        }
        productSales[key].qty += item.quantity;
        productSales[key].revenue += Number(item.price) * item.quantity;
      });
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  })();

  const recentOrders = orders?.slice(0, 6) || [];

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "bg-green-50 text-green-600 dark:bg-green-950/30", trend: "+12%", trendUp: true },
    { label: "Orders", value: totalOrders, icon: ShoppingCart, color: "bg-primary/10 text-primary", subtext: `${pendingOrders} pending` },
    { label: "Products", value: products || 0, icon: Package, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30", subtext: `${lowStockProducts?.length || 0} out of stock` },
    { label: "Customers", value: customers || 0, icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30" },
  ];

  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your store performance</p>
        </div>
        {notifications.length > 0 && (
          <div className="relative">
            <Bell size={20} className="text-primary" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {notifications.length}
            </span>
          </div>
        )}
      </div>

      {/* Real-time Notifications */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {notifications.slice(0, 3).map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900">
                    <ShoppingCart size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      New order #{notif.orderId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {formatPrice(notif.total)} · {notif.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => dismissNotification(notif.id)} className="text-green-500 hover:text-green-700">
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="font-heading text-2xl font-bold tracking-tight">{stat.value}</p>
                {"trend" in stat && stat.trend && (
                  <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${"trendUp" in stat && stat.trendUp ? "text-green-600" : "text-red-500"}`}>
                    {"trendUp" in stat && stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </div>
                )}
                {"subtext" in stat && stat.subtext && (
                  <p className="text-[11px] text-muted-foreground">{stat.subtext}</p>
                )}
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color} transition-transform group-hover:scale-105`}>
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-semibold">Revenue (7 Days)</h3>
              <p className="text-xs text-muted-foreground">Daily sales performance</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
              <DollarSign size={12} />
              {formatPrice(totalRevenue)}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(346, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(346, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(340, 15%, 90%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(340,15%,90%)", fontSize: "12px" }}
                  formatter={(value: number) => [`GH₵${value.toFixed(2)}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(346, 60%, 45%)" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-1">Order Status</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution by status</p>
          {ordersByStatus.length > 0 ? (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                      {ordersByStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px", border: "1px solid hsl(340,15%,90%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ordersByStatus.map((s, i) => (
                  <span key={s.name} className="flex items-center gap-1.5 text-[11px] capitalize text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No data</div>
          )}
        </motion.div>
      </div>

      {/* Referrals & Top Products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-primary" />
            <div>
              <h3 className="font-heading text-sm font-semibold">Referral Sources</h3>
              <p className="text-xs text-muted-foreground">Where your customers come from</p>
            </div>
          </div>
          {referralData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={referralData.slice(0, 6)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="source" type="category" tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px", border: "1px solid hsl(340,15%,90%)" }} />
                  <Bar dataKey="count" fill="hsl(346, 60%, 45%)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              No referral data yet
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-1">Top Products</h3>
          <p className="text-xs text-muted-foreground mb-4">Best sellers by revenue</p>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                  {p.image && <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.qty} sold</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(p.revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No sales data yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders & Out of Stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.35 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="font-heading text-sm font-semibold">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest transactions</p>
            </div>
            <a href="/admin/orders" className="text-xs font-medium text-primary hover:underline">View all →</a>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/40">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Payment</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const StatusIcon = STATUS_ICONS[order.status] || Clock;
                    return (
                      <tr key={order.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs font-semibold">#{order.id.slice(0, 8)}</p>
                          <p className="text-[10px] text-muted-foreground md:hidden mt-0.5">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                          {order.payment_method || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}>
                            <StatusIcon size={10} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-bold">{formatPrice(Number(order.total))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-muted-foreground">No orders yet</div>
          )}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <Package size={16} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold">Out of Stock</h3>
              <p className="text-xs text-muted-foreground">{lowStockProducts?.length || 0} products</p>
            </div>
          </div>
          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-red-50/50 p-2.5">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <span className="text-[10px] font-semibold text-red-500">Out of stock</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-green-600 bg-green-50/50 rounded-xl">
              <CheckCircle2 size={16} className="mr-1.5" /> All products in stock
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Stats Footer */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.45 }}
        className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold mb-3">Quick Metrics</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <p className="font-heading text-xl font-bold">{formatPrice(avgOrderValue)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Avg. Order Value</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold">{pendingOrders}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending Orders</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold">{orders?.filter((o) => o.status === "delivered").length || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Delivered</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold">{referralData.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Traffic Sources</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
