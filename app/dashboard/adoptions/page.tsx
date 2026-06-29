"use client"

import { useState } from "react";
import { Dog, Cat, Search, CheckCircle, Clock, FileText, ChevronRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const adoptionApplications = [
  { id: "ADO-112", animalName: "Mango", animalSpecies: "dog", animalBreed: "Golden Retriever", applicantName: "Clara & Tom Nguyen", appliedDate: "Dec 19, 2024", status: "under_review", homeVisit: "Dec 23, 2024", notes: "Family with two children, large backyard." },
  { id: "ADO-111", animalName: "Cleo", animalSpecies: "cat", animalBreed: "Maine Coon", applicantName: "Priya Sharma", appliedDate: "Dec 18, 2024", status: "approved", homeVisit: "Dec 22, 2024", notes: "Single owner, indoor apartment, experienced cat owner." },
  { id: "ADO-110", animalName: "Biscuit", animalSpecies: "dog", animalBreed: "Beagle Mix", applicantName: "Marcus Reed", appliedDate: "Dec 17, 2024", status: "home_visit", homeVisit: "Dec 21, 2024", notes: "Suburban home, fenced yard, has one resident dog." },
  { id: "ADO-109", animalName: "Nala", animalSpecies: "cat", animalBreed: "Siamese", applicantName: "Elena Kowalski", appliedDate: "Dec 16, 2024", status: "approved", homeVisit: "Dec 20, 2024", notes: "Quiet household, no other pets." },
  { id: "ADO-108", animalName: "Scout", animalSpecies: "dog", animalBreed: "Border Collie", applicantName: "David & Ana Torres", appliedDate: "Dec 15, 2024", status: "under_review", homeVisit: "Dec 24, 2024", notes: "Active family, runs daily, large outdoor space." },
  { id: "ADO-107", animalName: "Willow", animalSpecies: "cat", animalBreed: "Ragdoll", applicantName: "Helen Park", appliedDate: "Dec 12, 2024", status: "completed", homeVisit: "Dec 16, 2024", notes: "Retired, home all day, previous ragdoll owner." },
  { id: "ADO-106", animalName: "Bruno", animalSpecies: "dog", animalBreed: "Labrador Mix", applicantName: "James Okafor", appliedDate: "Dec 10, 2024", status: "completed", homeVisit: "Dec 14, 2024", notes: "Single professional, dog daycare enrolled." },
  { id: "ADO-105", animalName: "Mochi", animalSpecies: "cat", animalBreed: "Persian", applicantName: "Camille Dufour", appliedDate: "Dec 8, 2024", status: "completed", homeVisit: "Dec 12, 2024", notes: "Remote worker, calm environment." },
];

const monthlyData = [
  { month: "Jul", count: 20 },
  { month: "Aug", count: 25 },
  { month: "Sep", count: 17 },
  { month: "Oct", count: 22 },
  { month: "Nov", count: 19 },
  { month: "Dec", count: 41 },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  under_review: { label: "Under Review", color: "#6B9FAE", bg: "#EAF3F6" },
  home_visit: { label: "Home Visit", color: "#E8A87C", bg: "#FDF2EA" },
  approved: { label: "Approved", color: "#43AE6D", bg: "#EBF7F1" },
  completed: { label: "Adopted", color: "#7A7670", bg: "#EDE9E1" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "#7A7670", bg: "#EDE9E1" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function Page() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");

  const filtered = adoptionApplications.filter((a) => {
    const matchSearch =
      a.animalName.toLowerCase().includes(search.toLowerCase()) ||
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.includes(search);
    const matchTab =
      tab === "all" ||
      (tab === "active" && ["under_review", "home_visit", "approved"].includes(a.status)) ||
      (tab === "completed" && a.status === "completed");
    return matchSearch && matchTab;
  });

  const activeCount = adoptionApplications.filter((a) => ["under_review", "home_visit", "approved"].includes(a.status)).length;
  const completedCount = adoptionApplications.filter((a) => a.status === "completed").length;

  return (
    <div className="px-8 py-7">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Adoptions</h2>
          <p className="text-sm text-muted-foreground mt-1">Track applications, home visits, and completed adoptions</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-5 mb-7">
        {[
          { label: "Total This Month", value: "41", icon: <CheckCircle size={17} />, color: "#43AE6D", bg: "#EBF7F1", sub: "+12% vs November" },
          { label: "Active Applications", value: String(activeCount), icon: <Clock size={17} />, color: "#6B9FAE", bg: "#EAF3F6", sub: `${activeCount} in progress` },
          { label: "Home Visits Pending", value: "3", icon: <FileText size={17} />, color: "#E8A87C", bg: "#FDF2EA", sub: "Scheduled this week" },
          { label: "Approval Rate", value: "94%", icon: <TrendingUp size={17} />, color: "#43AE6D", bg: "#EBF7F1", sub: "Last 90 days" },
        ].map(({ label, value, icon, color, bg, sub }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>{icon}</div>
            </div>
            <p className="text-3xl font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Applications table */}
        <div className="col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-secondary rounded-xl">
              {(["all", "active", "completed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    backgroundColor: tab === t ? "#FFFFFF" : "transparent",
                    color: tab === t ? "#2E2E2E" : "#7A7670",
                    boxShadow: tab === t ? "0 1px 3px rgba(46,46,46,0.08)" : "none",
                  }}
                >
                  {t === "all" ? `All (${adoptionApplications.length})` : t === "active" ? `Active (${activeCount})` : `Completed (${completedCount})`}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm bg-secondary border border-border rounded-xl outline-none w-44 focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((app) => (
              <div key={app.id} className="px-5 py-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: app.animalSpecies === "dog" ? "#EBF7F1" : "#FDF2EA" }}>
                      {app.animalSpecies === "dog" ? <Dog size={16} style={{ color: "#43AE6D" }} /> : <Cat size={16} style={{ color: "#E8A87C" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{app.animalName}</p>
                        <span className="text-xs text-muted-foreground">·</span>
                        <p className="text-xs text-muted-foreground">{app.animalBreed}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Applicant: <span className="font-medium text-foreground">{app.applicantName}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.notes}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={app.status} />
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{app.id}</p>
                      <span className="text-muted-foreground">·</span>
                      <p className="text-xs text-muted-foreground">Applied {app.appliedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={11} />
                    Home visit: <span className="font-medium text-foreground">{app.homeVisit}</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-75 transition-opacity">
                    View details <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly chart + pipeline */}
        <div className="flex flex-col gap-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Monthly Adoptions</h3>
            <p className="text-xs text-muted-foreground mb-4">Last 6 months · completed</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#7A7670", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [v, "Adoptions"]} contentStyle={{ borderRadius: "12px", border: "1px solid rgba(46,46,46,0.08)", fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={index} fill={index === monthlyData.length - 1 ? "#43AE6D" : "#D8C4A5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline stages */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline</h3>
            <div className="space-y-3">
              {[
                { label: "Under Review", count: 2, color: "#6B9FAE", bg: "#EAF3F6", pct: 40 },
                { label: "Home Visit", count: 3, color: "#E8A87C", bg: "#FDF2EA", pct: 60 },
                { label: "Approved", count: 2, color: "#43AE6D", bg: "#EBF7F1", pct: 40 },
              ].map(({ label, count, color, bg, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <span className="text-xs font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: bg }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
