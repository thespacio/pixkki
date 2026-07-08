"use client"
import { useState } from "react";
import { DollarSign, TrendingUp, Users, Repeat, Search, Download, ChevronUp, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const page = [
  { id: "DON-2041", name: "Sarah Mitchell", amount: 500, type: "one_time", campaign: "Winter Drive", date: "Dec 20, 2024", method: "Credit Card", status: "completed" },
  { id: "DON-2040", name: "The Green Paw Foundation", amount: 2000, type: "corporate", campaign: "General Fund", date: "Dec 19, 2024", method: "Bank Transfer", status: "completed" },
  { id: "DON-2039", name: "James & Elena Park", amount: 150, type: "monthly", campaign: "Medical Care", date: "Dec 18, 2024", method: "Auto-debit", status: "completed" },
  { id: "DON-2038", name: "Anonymous", amount: 75, type: "one_time", campaign: "Winter Drive", date: "Dec 17, 2024", method: "PayPal", status: "completed" },
  { id: "DON-2037", name: "Willowbrook Community Fund", amount: 1200, type: "grant", campaign: "Facility Upgrade", date: "Dec 15, 2024", method: "Check", status: "completed" },
  { id: "DON-2036", name: "Natasha Ivanov", amount: 250, type: "monthly", campaign: "Food & Care", date: "Dec 14, 2024", method: "Auto-debit", status: "completed" },
  { id: "DON-2035", name: "Bright Future LLC", amount: 3500, type: "corporate", campaign: "General Fund", date: "Dec 12, 2024", method: "Bank Transfer", status: "pending" },
  { id: "DON-2034", name: "Michael Osei", amount: 100, type: "one_time", campaign: "Winter Drive", date: "Dec 11, 2024", method: "Credit Card", status: "completed" },
  { id: "DON-2033", name: "Carmen Lopez", amount: 50, type: "monthly", campaign: "Food & Care", date: "Dec 10, 2024", method: "Auto-debit", status: "completed" },
  { id: "DON-2032", name: "The Harrison Trust", amount: 5000, type: "grant", campaign: "Capital Campaign", date: "Dec 8, 2024", method: "Bank Transfer", status: "completed" },
];

const monthlyTrend = [
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 4800 },
  { month: "Mar", amount: 3900 },
  { month: "Apr", amount: 5200 },
  { month: "May", amount: 6800 },
  { month: "Jun", amount: 5500 },
  { month: "Jul", amount: 7200 },
  { month: "Aug", amount: 6100 },
  { month: "Sep", amount: 8400 },
  { month: "Oct", amount: 7600 },
  { month: "Nov", amount: 9100 },
  { month: "Dec", amount: 11200 },
];

const byType = [
  { name: "One-time", value: 35, color: "#43AE6D" },
  { name: "Monthly", value: 28, color: "#6B9FAE" },
  { name: "Corporate", value: 22, color: "#D8C4A5" },
  { name: "Grants", value: 15, color: "#E8A87C" },
];

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  one_time: { label: "One-time", color: "#43AE6D", bg: "#EBF7F1" },
  monthly: { label: "Monthly", color: "#6B9FAE", bg: "#EAF3F6" },
  corporate: { label: "Corporate", color: "#2E2E2E", bg: "#EDE9E1" },
  grant: { label: "Grant", color: "#E8A87C", bg: "#FDF2EA" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "#43AE6D", bg: "#EBF7F1" },
  pending: { label: "Pending", color: "#E8A87C", bg: "#FDF2EA" },
};

function Badge({ cfg }: { cfg: { label: string; color: string; bg: string } }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export default function Donations() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = page.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search) || d.campaign.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const total = page.reduce((s, d) => s + d.amount, 0);
  const monthlyTotal = page.filter((d) => d.type === "monthly").reduce((s, d) => s + d.amount, 0);
  const uniqueDonors = new Set(page.map((d) => d.name)).size;

  return (
    <div className="px-8 py-7">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Donations</h2>
          <p className="text-sm text-muted-foreground mt-1">Track contributions, campaigns, and donor relationships</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground bg-card border border-border hover:text-foreground transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-5 mb-7">
        {[
          { label: "Total This Month", value: "$11,200", icon: <DollarSign size={17} />, color: "#43AE6D", bg: "#EBF7F1", sub: "+23% vs November", up: true },
          { label: "YTD Revenue", value: "$79,000", icon: <TrendingUp size={17} />, color: "#6B9FAE", bg: "#EAF3F6", sub: "+31% vs last year", up: true },
          { label: "Recurring Donors", value: String(uniqueDonors), icon: <Users size={17} />, color: "#E8A87C", bg: "#FDF2EA", sub: "Active this month", up: true },
          { label: "Monthly Giving", value: `$${monthlyTotal.toLocaleString()}`, icon: <Repeat size={17} />, color: "#D8C4A5", bg: "#F6F1E9", sub: "Recurring revenue", up: false },
        ].map(({ label, value, icon, color, bg, sub, up }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>{icon}</div>
            </div>
            <p className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {up ? <ChevronUp size={12} style={{ color: "#43AE6D" }} /> : <ChevronDown size={12} style={{ color: "#D94F4F" }} />}
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-7">
        {/* Area chart */}
        <div className="col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Donation Revenue 2024</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All channels · monthly total</p>
            </div>
            <p className="text-xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>$79,000</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43AE6D" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#43AE6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#43AE6D" strokeWidth={2.5} fill="url(#donGrad)" dot={false} activeDot={{ r: 4, fill: "#43AE6D" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">By Donation Type</h3>
          <p className="text-xs text-muted-foreground mb-4">% of total revenue</p>
          <div className="flex items-center justify-center mb-4">
            <PieChart width={140} height={140}>
              <Pie data={byType} cx={65} cy={65} innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {byType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2.5">
            {byType.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-xs text-foreground font-medium">{name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
          <div className="flex items-center gap-1.5 ml-4">
            {["all", "one_time", "monthly", "corporate", "grant"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  backgroundColor: typeFilter === t ? (t === "all" ? "#2E2E2E" : typeConfig[t]?.bg) : "transparent",
                  color: typeFilter === t ? (t === "all" ? "#fff" : typeConfig[t]?.color) : "#7A7670",
                }}
              >
                {t === "all" ? "All" : typeConfig[t]?.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search donor, ID, campaign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm bg-secondary border border-border rounded-xl outline-none w-52 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Donor</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Amount</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Type</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Campaign</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Method</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Date</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="px-6 py-3.5">
                  <p className="text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.id}</p>
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${d.amount.toLocaleString()}</td>
                <td className="px-4 py-3.5"><Badge cfg={typeConfig[d.type] ?? { label: d.type, color: "#7A7670", bg: "#EDE9E1" }} /></td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{d.campaign}</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{d.method}</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{d.date}</td>
                <td className="px-4 py-3.5"><Badge cfg={statusConfig[d.status] ?? { label: d.status, color: "#7A7670", bg: "#EDE9E1" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-3.5 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length}</span> transactions</p>
          <p className="text-xs font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Total: ${filtered.reduce((s, d) => s + d.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
