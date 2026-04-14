import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { motion } from "framer-motion";
import { Users, TrendingUp, ShoppingBag, Crown, Search, Download, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SEGMENT_COLORS = ["hsl(12, 80%, 48%)", "hsl(35, 70%, 50%)", "hsl(210, 60%, 50%)", "hsl(150, 50%, 45%)"];

const AdminCustomerInsights = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"revenue" | "orders" | "recent">("revenue");

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-customer-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-customer-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("user_id, total, created_at, status");
      if (error) throw error;
      return data;
    },
  });

  const customerData = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; joined: string; totalSpent: number; orderCount: number; lastOrder: string; avgOrder: number }>();

    profiles.forEach((p) => {
      map.set(p.user_id, {
        name: p.full_name || "Unnamed",
        phone: p.phone || "-",
        joined: p.created_at,
        totalSpent: 0,
        orderCount: 0,
        lastOrder: "",
        avgOrder: 0,
      });
    });

    orders.forEach((o) => {
      const c = map.get(o.user_id);
      if (c) {
        c.totalSpent += o.total;
        c.orderCount += 1;
        if (!c.lastOrder || o.created_at > c.lastOrder) c.lastOrder = o.created_at;
      }
    });

    map.forEach((c) => {
      c.avgOrder = c.orderCount > 0 ? c.totalSpent / c.orderCount : 0;
    });

    return Array.from(map.entries()).map(([id, c]) => ({ id, ...c }));
  }, [profiles, orders]);

  const sorted = useMemo(() => {
    const filtered = customerData.filter(
      (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    );
    if (sortBy === "revenue") return filtered.sort((a, b) => b.totalSpent - a.totalSpent);
    if (sortBy === "orders") return filtered.sort((a, b) => b.orderCount - a.orderCount);
    return filtered.sort((a, b) => (b.lastOrder || "").localeCompare(a.lastOrder || ""));
  }, [customerData, search, sortBy]);

  // Segments
  const segments = useMemo(() => {
    const vip = customerData.filter((c) => c.totalSpent >= 50000);
    const regular = customerData.filter((c) => c.totalSpent >= 10000 && c.totalSpent < 50000);
    const occasional = customerData.filter((c) => c.totalSpent > 0 && c.totalSpent < 10000);
    const inactive = customerData.filter((c) => c.totalSpent === 0);
    return [
      { name: "VIP (500+)", value: vip.length },
      { name: "Regular (100-500)", value: regular.length },
      { name: "Occasional (<100)", value: occasional.length },
      { name: "Inactive", value: inactive.length },
    ];
  }, [customerData]);

  // Monthly signups
  const monthlySignups = useMemo(() => {
    const months: Record<string, number> = {};
    profiles.forEach((p) => {
      const m = new Date(p.created_at).toLocaleDateString("en", { month: "short", year: "2-digit" });
      months[m] = (months[m] || 0) + 1;
    });
    return Object.entries(months).slice(-6).map(([month, count]) => ({ month, count }));
  }, [profiles]);

  const totalRevenue = customerData.reduce((s, c) => s + c.totalSpent, 0);
  const avgLTV = customerData.length > 0 ? totalRevenue / customerData.length : 0;

  const exportCSV = () => {
    const header = "Name,Phone,Joined,Total Spent,Orders,Avg Order,Last Order\n";
    const rows = sorted
      .map((c) =>
        `"${c.name}","${c.phone}","${new Date(c.joined).toLocaleDateString()}",${c.totalSpent},${c.orderCount},${c.avgOrder.toFixed(2)},"${c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : "-"}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Customer Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profiles.length} total customers</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-muted/50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Users, label: "Total Customers", value: profiles.length.toString() },
          { icon: TrendingUp, label: "Total Revenue", value: formatPrice(totalRevenue) },
          { icon: Crown, label: "Avg Lifetime Value", value: formatPrice(avgLTV) },
          { icon: ShoppingBag, label: "Total Orders", value: orders.length.toString() },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-border bg-card p-4"
          >
            <kpi.icon size={18} className="text-primary" />
            <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={segments} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {segments.map((_, i) => (
                  <Cell key={i} fill={SEGMENT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Monthly Signups</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlySignups}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(12, 80%, 48%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex border border-border">
          {(["revenue", "orders", "recent"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                sortBy === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "revenue" ? "Top Spenders" : s === "orders" ? "Most Orders" : "Recent"}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Total Spent</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Avg Order</th>
              <th className="px-4 py-3">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((c) => (
              <tr key={c.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(c.joined).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(c.totalSpent)}</td>
                <td className="px-4 py-3 text-right">{c.orderCount}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatPrice(c.avgOrder)}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No customers found</div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerInsights;
