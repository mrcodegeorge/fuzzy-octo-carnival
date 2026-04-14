import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import {
  TrendingUp, Users, ShoppingCart, Globe, CalendarDays,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { format, subDays, isAfter, parseISO, startOfDay } from "date-fns";

const PIE_COLORS = [
  "hsl(346, 60%, 45%)", "hsl(35, 70%, 50%)", "hsl(210, 60%, 50%)",
  "hsl(150, 50%, 45%)", "hsl(280, 50%, 55%)", "hsl(0, 60%, 55%)",
];

type DateRange = "7" | "14" | "30" | "90" | "all";

const AdminAnalytics = () => {
  const [range, setRange] = useState<DateRange>("30");

  const { data: orders } = useQuery({
    queryKey: ["analytics-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: true });
      return data || [];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["analytics-customers"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("created_at").order("created_at", { ascending: true });
      return data || [];
    },
  });

  const cutoffDate = range === "all" ? null : startOfDay(subDays(new Date(), parseInt(range)));

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (!cutoffDate) return orders;
    return orders.filter((o) => isAfter(parseISO(o.created_at), cutoffDate));
  }, [orders, cutoffDate]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!cutoffDate) return customers;
    return customers.filter((c) => isAfter(parseISO(c.created_at), cutoffDate));
  }, [customers, cutoffDate]);

  // Revenue over time (daily)
  const revenueData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const map: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const day = format(parseISO(o.created_at), "MMM dd");
      map[day] = (map[day] || 0) + Number(o.total) / 100;
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
  }, [filteredOrders]);

  // Orders over time
  const ordersData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const map: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const day = format(parseISO(o.created_at), "MMM dd");
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [filteredOrders]);

  // Customer growth
  const customerGrowthData = useMemo(() => {
    if (!filteredCustomers.length) return [];
    const map: Record<string, number> = {};
    filteredCustomers.forEach((c) => {
      const day = format(parseISO(c.created_at), "MMM dd");
      map[day] = (map[day] || 0) + 1;
    });
    let cumulative = 0;
    return Object.entries(map).map(([date, count]) => {
      cumulative += count;
      return { date, newCustomers: count, total: cumulative };
    });
  }, [filteredCustomers]);

  // Referral sources
  const referralData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const sources: Record<string, { count: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      const src = o.referral_source || "Direct";
      if (!sources[src]) sources[src] = { count: 0, revenue: 0 };
      sources[src].count += 1;
      sources[src].revenue += Number(o.total);
    });
    return Object.entries(sources)
      .map(([source, data]) => ({
        source,
        orders: data.count,
        revenue: data.revenue,
        conversionRate: ((data.count / filteredOrders.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.orders - a.orders);
  }, [filteredOrders]);

  // Payment methods
  const paymentData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const methods: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const m = o.payment_method || "Unknown";
      methods[m] = (methods[m] || 0) + 1;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // Status breakdown
  const statusData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const statuses: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      statuses[o.status] = (statuses[o.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const newCustomersCount = filteredCustomers.length;

  const tooltipStyle = { borderRadius: "10px", border: "1px solid hsl(340,15%,90%)", fontSize: "12px" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">Detailed store performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-muted-foreground" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRange)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "bg-green-50 text-green-600" },
          { label: "Orders", value: totalOrdersCount, icon: ShoppingCart, color: "bg-primary/10 text-primary" },
          { label: "Avg. Order Value", value: formatPrice(avgOrderValue), icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
          { label: "New Customers", value: newCustomersCount, icon: Users, color: "bg-blue-50 text-blue-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold mb-1">Revenue Trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Daily revenue over selected period</p>
        <div className="h-64">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(346, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(346, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(340,15%,90%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`GH₵${v.toFixed(2)}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(346, 60%, 45%)" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No revenue data</div>
          )}
        </div>
      </div>

      {/* Orders + Customer Growth */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-1">Orders Over Time</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily order count</p>
          <div className="h-52">
            {ordersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(340,15%,90%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(346, 60%, 45%)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-1">Customer Growth</h3>
          <p className="text-xs text-muted-foreground mb-4">Cumulative customer registrations</p>
          <div className="h-52">
            {customerGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(340,15%,90%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="total" stroke="hsl(210, 60%, 50%)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="newCustomers" stroke="hsl(35, 70%, 50%)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Sources + Payment/Status */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Referral Table */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-primary" />
            <div>
              <h3 className="font-heading text-sm font-semibold">Referral Conversion</h3>
              <p className="text-xs text-muted-foreground">Traffic sources and their performance</p>
            </div>
          </div>
          {referralData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-[11px] font-semibold text-muted-foreground uppercase">Source</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-muted-foreground uppercase">Orders</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-muted-foreground uppercase">Revenue</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-muted-foreground uppercase">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.map((r) => (
                    <tr key={r.source} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium capitalize">{r.source}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{r.orders}</td>
                      <td className="py-2.5 text-right font-semibold">{formatPrice(r.revenue)}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {r.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No referral data. Share links with ?utm_source=facebook
            </div>
          )}
        </div>

        {/* Payment + Status Pies */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-heading text-sm font-semibold mb-3">Payment Methods</h3>
            {paymentData.length > 0 ? (
              <>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} strokeWidth={0}>
                        {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {paymentData.map((p, i) => (
                    <span key={p.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {p.name} ({p.value})
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-4">No data</div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-heading text-sm font-semibold mb-3">Order Status</h3>
            {statusData.length > 0 ? (
              <div className="space-y-2">
                {statusData.map((s) => {
                  const pct = totalOrdersCount > 0 ? (s.value / totalOrdersCount) * 100 : 0;
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="capitalize font-medium">{s.name}</span>
                        <span className="text-muted-foreground">{s.value} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-4">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
