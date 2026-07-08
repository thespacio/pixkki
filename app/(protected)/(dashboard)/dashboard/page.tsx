"use client"

import { TrendingUp, TrendingDown, PawPrint, Heart, DollarSign, BarChart2, Dog, Cat, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const adoptionData = [
  { month: "Jan", dogs: 8, cats: 12 },
  { month: "Feb", dogs: 11, cats: 9 },
  { month: "Mar", dogs: 15, cats: 14 },
  { month: "Apr", dogs: 10, cats: 17 },
  { month: "May", dogs: 18, cats: 13 },
  { month: "Jun", dogs: 22, cats: 19 },
  { month: "Jul", dogs: 20, cats: 21 },
  { month: "Aug", dogs: 25, cats: 16 },
  { month: "Sep", dogs: 17, cats: 22 },
  { month: "Oct", dogs: 19, cats: 18 },
  { month: "Nov", dogs: 14, cats: 20 },
  { month: "Dec", dogs: 21, cats: 15 },
];

const donationData = [
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

const occupancyData = [
  { week: "W1", rate: 72 },
  { week: "W2", rate: 78 },
  { week: "W3", rate: 85 },
  { week: "W4", rate: 81 },
  { week: "W5", rate: 74 },
  { week: "W6", rate: 68 },
  { week: "W7", rate: 76 },
  { week: "W8", rate: 83 },
];

const recentAnimals = [
  { id: "A-0241", name: "Mango", species: "dog", breed: "Golden Retriever", age: "3y", status: "available", intake: "Dec 18" },
  { id: "A-0240", name: "Luna", species: "cat", breed: "Domestic Shorthair", age: "1y", status: "medical", intake: "Dec 17" },
  { id: "A-0239", name: "Biscuit", species: "dog", breed: "Beagle Mix", age: "5y", status: "pending", intake: "Dec 16" },
  { id: "A-0238", name: "Cleo", species: "cat", breed: "Maine Coon", age: "2y", status: "available", intake: "Dec 15" },
  { id: "A-0237", name: "Bruno", species: "dog", breed: "Labrador Mix", age: "4y", status: "adopted", intake: "Dec 12" },
];

const recentDonations = [
  { name: "Sarah Mitchell", amount: 500, type: "One-time", date: "Dec 20" },
  { name: "The Green Paw Foundation", amount: 2000, type: "Corporate", date: "Dec 19" },
  { name: "James & Elena Park", amount: 150, type: "Monthly", date: "Dec 18" },
  { name: "Anonymous", amount: 75, type: "One-time", date: "Dec 17" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#43AE6D", bg: "#EBF7F1" },
  medical: { label: "Medical Hold", color: "#E8A87C", bg: "#FDF2EA" },
  pending: { label: "Pending", color: "#6B9FAE", bg: "#EAF3F6" },
  adopted: { label: "Adopted", color: "#7A7670", bg: "#EDE9E1" },
};

function KpiCard({ label, value, sub, trend, trendUp, icon, accentColor, accentBg }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentBg, color: accentColor }}>{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {trendUp ? <TrendingUp size={13} style={{ color: "#43AE6D" }} /> : <TrendingDown size={13} style={{ color: "#D94F4F" }} />}
        <span className="text-xs font-semibold" style={{ color: trendUp ? "#43AE6D" : "#D94F4F" }}>{trend}</span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "#7A7670", bg: "#EDE9E1" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

const TooltipDonation = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const TooltipAdoption = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <p className="text-xs text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.dataKey}: <span className="font-semibold">{p.value}</span></p>
        </div>
      ))}
    </div>
  );
};

export default function Page() {
  return (
    <div className="px-8 py-7">
      <div className="grid grid-cols-4 gap-5 mb-7">
        <KpiCard label="Animales Refugiados" value="147" sub="84 dogs · 63 cats" trend="+4" trendUp={true} icon={<PawPrint size={18} />} accentColor="#43AE6D" accentBg="#EBF7F1" />
        <KpiCard label="Adopciones Mensuales" value="41" sub="This month · Dec 2024" trend="+12%" trendUp={true} icon={<Heart size={18} />} accentColor="#E8A87C" accentBg="#FDF2EA" />
        <KpiCard label="Donaciones recibidas" value="$11,200" sub="December · all channels" trend="+23%" trendUp={true} icon={<DollarSign size={18} />} accentColor="#6B9FAE" accentBg="#EAF3F6" />
        <KpiCard label="Ocupación del albergue" value="78%" sub="Capacity: 188 animals" trend="-3%" trendUp={false} icon={<BarChart2 size={18} />} accentColor="#D8C4A5" accentBg="#F6F1E9" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-7">
        <div className="col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Adoptions This Year</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Dogs vs. Cats — monthly breakdown</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><Dog size={13} style={{ color: "#43AE6D" }} /><span className="text-xs text-muted-foreground">Dogs</span></div>
              <div className="flex items-center gap-1.5"><Cat size={13} style={{ color: "#D8C4A5" }} /><span className="text-xs text-muted-foreground">Cats</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={adoptionData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43AE6D" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#43AE6D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D8C4A5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D8C4A5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipAdoption />} />
              <Area type="monotone" dataKey="dogs" stroke="#43AE6D" strokeWidth={2} fill="url(#gradDogs)" dot={false} activeDot={{ r: 4, fill: "#43AE6D" }} />
              <Area type="monotone" dataKey="cats" stroke="#D8C4A5" strokeWidth={2} fill="url(#gradCats)" dot={false} activeDot={{ r: 4, fill: "#D8C4A5" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground">Donation Revenue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">12-month trend · 2024</p>
            <p className="text-2xl font-semibold text-foreground mt-3 tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>$79,000</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={13} style={{ color: "#43AE6D" }} />
              <span className="text-xs font-medium" style={{ color: "#43AE6D" }}>+31% vs last year</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={donationData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<TooltipDonation />} />
              <Line type="monotone" dataKey="amount" stroke="#43AE6D" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#43AE6D" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Intakes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest animals admitted to shelter</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-75 transition-opacity">View all <ChevronRight size={13} /></button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Animal</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Breed</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Age</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Intake</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentAnimals.map((animal) => (
                <tr key={animal.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: animal.species === "dog" ? "#EBF7F1" : "#FDF2EA" }}>
                        {animal.species === "dog" ? <Dog size={14} style={{ color: "#43AE6D" }} /> : <Cat size={14} style={{ color: "#E8A87C" }} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{animal.name}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animal.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{animal.breed}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animal.age}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={animal.status} /></td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{animal.intake}</td>
                  <td className="px-4 py-3.5"><button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-card border border-border rounded-2xl p-5 flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1">Weekly Occupancy</h3>
            <p className="text-xs text-muted-foreground mb-4">% capacity used · last 8 weeks</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={occupancyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Occupancy"]} contentStyle={{ borderRadius: "12px", border: "1px solid rgba(46,46,46,0.08)", fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Bar dataKey="rate" fill="#43AE6D" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Donations</h3>
              <button className="text-xs font-medium text-primary hover:opacity-75 transition-opacity flex items-center gap-1">View all <ChevronRight size={12} /></button>
            </div>
            <ul className="space-y-3">
              {recentDonations.map((d, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "#EAF3F6", color: "#6B9FAE" }}>{d.type}</span>
                      <span className="text-xs text-muted-foreground">{d.date}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground ml-3 flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${d.amount.toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
