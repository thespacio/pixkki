"use client"

import { Dog, Cat, Search, Filter, Plus, MoreHorizontal, ChevronDown } from "lucide-react";
import {useState} from "react";

const allAnimals = [
  { id: "A-0241", name: "Mango", species: "dog", breed: "Golden Retriever", age: "3y", weight: "28 kg", status: "available", intake: "Dec 18, 2024", kennel: "K-12", sex: "Male" },
  { id: "A-0240", name: "Luna", species: "cat", breed: "Domestic Shorthair", age: "1y", weight: "3.8 kg", status: "medical", intake: "Dec 17, 2024", kennel: "C-04", sex: "Female" },
  { id: "A-0239", name: "Biscuit", species: "dog", breed: "Beagle Mix", age: "5y", weight: "11 kg", status: "pending", intake: "Dec 16, 2024", kennel: "K-07", sex: "Male" },
  { id: "A-0238", name: "Cleo", species: "cat", breed: "Maine Coon", age: "2y", weight: "5.2 kg", status: "available", intake: "Dec 15, 2024", kennel: "C-11", sex: "Female" },
  { id: "A-0237", name: "Bruno", species: "dog", breed: "Labrador Mix", age: "4y", weight: "32 kg", status: "adopted", intake: "Dec 12, 2024", kennel: "—", sex: "Male" },
  { id: "A-0236", name: "Nala", species: "cat", breed: "Siamese", age: "6y", weight: "4.1 kg", status: "available", intake: "Dec 10, 2024", kennel: "C-02", sex: "Female" },
  { id: "A-0235", name: "Duke", species: "dog", breed: "German Shepherd", age: "2y", weight: "35 kg", status: "medical", intake: "Dec 9, 2024", kennel: "K-15", sex: "Male" },
  { id: "A-0234", name: "Pepper", species: "cat", breed: "Tabby Mix", age: "8m", weight: "2.9 kg", status: "pending", intake: "Dec 7, 2024", kennel: "C-08", sex: "Female" },
  { id: "A-0233", name: "Rusty", species: "dog", breed: "Dachshund", age: "7y", weight: "8 kg", status: "available", intake: "Dec 5, 2024", kennel: "K-03", sex: "Male" },
  { id: "A-0232", name: "Mochi", species: "cat", breed: "Persian", age: "3y", weight: "4.5 kg", status: "adopted", intake: "Dec 2, 2024", kennel: "—", sex: "Female" },
  { id: "A-0231", name: "Scout", species: "dog", breed: "Border Collie", age: "1y", weight: "18 kg", status: "available", intake: "Nov 28, 2024", kennel: "K-09", sex: "Male" },
  { id: "A-0230", name: "Willow", species: "cat", breed: "Ragdoll", age: "4y", weight: "5.8 kg", status: "available", intake: "Nov 25, 2024", kennel: "C-06", sex: "Female" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#43AE6D", bg: "#EBF7F1" },
  medical: { label: "Medical Hold", color: "#E8A87C", bg: "#FDF2EA" },
  pending: { label: "Pending", color: "#6B9FAE", bg: "#EAF3F6" },
  adopted: { label: "Adopted", color: "#7A7670", bg: "#EDE9E1" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "#7A7670", bg: "#EDE9E1" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function Page() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<"all" | "dog" | "cat">("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = allAnimals.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search) || a.breed.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = speciesFilter === "all" || a.species === speciesFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchSpecies && matchStatus;
  });

  const dogCount = allAnimals.filter((a) => a.species === "dog").length;
  const catCount = allAnimals.filter((a) => a.species === "cat").length;
  const availableCount = allAnimals.filter((a) => a.status === "available").length;

  return (
    <div className="px-8 py-7">

      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Animals</h2>
          <p className="text-sm text-muted-foreground mt-1">{allAnimals.length} animals currently in the system</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity" style={{ backgroundColor: "#43AE6D" }}>
          <Plus size={15} /> Register Animal
        </button>
      </div>


      <div className="flex gap-3 mb-7">
        {[
          { label: "All Animals", count: allAnimals.length, key: "all", color: "#2E2E2E", bg: "#EDE9E1" },
          { label: "Dogs", count: dogCount, key: "dog", color: "#43AE6D", bg: "#EBF7F1" },
          { label: "Cats", count: catCount, key: "cat", color: "#E8A87C", bg: "#FDF2EA" },
        ].map(({ label, count, key, color, bg }) => (
          <button
            key={key}
            onClick={() => setSpeciesFilter(key as never)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
            style={{
              backgroundColor: speciesFilter === key ? bg : "#FFFFFF",
              color: speciesFilter === key ? color : "#7A7670",
              borderColor: speciesFilter === key ? color + "40" : "rgba(46,46,46,0.08)",
            }}
          >
            {key === "dog" && <Dog size={14} />}
            {key === "cat" && <Cat size={14} />}
            {label}
            <span className="ml-1 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl" style={{ backgroundColor: "#EBF7F1", color: "#43AE6D" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          {availableCount} available for adoption
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Filter size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-1">Status:</span>
            {["all", "available", "medical", "pending", "adopted"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  backgroundColor: statusFilter === s ? (s === "all" ? "#2E2E2E" : statusConfig[s]?.bg ?? "#EDE9E1") : "transparent",
                  color: statusFilter === s ? (s === "all" ? "#fff" : statusConfig[s]?.color ?? "#7A7670") : "#7A7670",
                }}
              >
                {s === "all" ? "All" : statusConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Animal</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Breed</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sex</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Age</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Weight</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Kennel</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Intake Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">No animals match your search.</td>
                </tr>
              ) : (
                filtered.map((animal) => (
                  <tr key={animal.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: animal.species === "dog" ? "#EBF7F1" : "#FDF2EA" }}>
                          {animal.species === "dog" ? <Dog size={15} style={{ color: "#43AE6D" }} /> : <Cat size={15} style={{ color: "#E8A87C" }} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{animal.name}</p>
                          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animal.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{animal.breed}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{animal.sex}</td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animal.age}</td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animal.weight}</td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animal.kennel}</td>
                    <td className="px-4 py-4"><StatusBadge status={animal.status} /></td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{animal.intake}</td>
                    <td className="px-4 py-4"><button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal size={14} /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing <span className="font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length}</span> of <span className="font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{allAnimals.length}</span> animals</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button className="px-3 py-1.5 rounded-lg bg-secondary border border-border hover:text-foreground transition-colors">Previous</button>
            <span className="px-3 py-1.5 rounded-lg font-medium text-foreground" style={{ backgroundColor: "#EBF7F1", color: "#43AE6D" }}>1</span>
            <button className="px-3 py-1.5 rounded-lg bg-secondary border border-border hover:text-foreground transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
