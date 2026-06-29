"use client"
import { useState } from "react";
import {Plus, Search, Filter, MoreHorizontal, Dog, Cat, Edit2, Trash2} from "lucide-react";
import {useRouter} from "next/navigation";
import {router} from "next/client";

// Configuraciones
const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  veterinarian: { label: "Veterinario", color: "#43AE6D", bg: "#EBF7F1" },
  operator: { label: "Operador", color: "#6B9FAE", bg: "#EAF3F6" },
  coordinator: { label: "Coordinador", color: "#E8A87C", bg: "#FDF2EA" },
  evaluator: { label: "Evaluador", color: "#7A7670", bg: "#EDE9E1" },
};



export default function StaffManagement() {

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "veterinarian" | "operator" | "coordinator" | "evaluator">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const addStaff = () => {
    // Aquí puedes agregar lógica de logout
    router.push('/dashboard/staff/add/');
  };

  // Datos de ejemplo - reemplazar con tus datos reales
  const allStaff = [
    {
      id: "001",
      name: "María García",
      rol: "veterinarian",
      email: "maria@example.com",
      species: "dog",
      breed: "Labrador",
      sex: "Female",
      age: "3 years",
      weight: "25 kg",
      kennel: "K-12",
      intake: "2024-01-15"
    },
    {
      id: "002",
      name: "Carlos López",
      rol: "operator",
      status: "pending",
      email: "carlos@example.com",
      species: "cat",
      breed: "Siamese",
      sex: "Male",
      age: "2 years",
      weight: "4 kg",
      kennel: "C-05",
      intake: "2024-02-20"
    },
    {
      id: "003",
      name: "Ana Martínez",
      rol: "coordinator",
      email: "ana@example.com",
      species: "dog",
      breed: "Golden Retriever",
      sex: "Female",
      age: "4 years",
      weight: "30 kg",
      kennel: "K-08",
      intake: "2024-01-10"
    },
    {
      id: "004",
      name: "Pedro Sánchez",
      rol: "evaluator",
      email: "pedro@example.com",
      species: "cat",
      breed: "Persian",
      sex: "Male",
      age: "1 year",
      weight: "3.5 kg",
      kennel: "C-12",
      intake: "2024-03-05"
    },
    {
      id: "005",
      name: "Laura Pérez",
      rol: "veterinarian",
      email: "laura@example.com",
      species: "dog",
      breed: "Beagle",
      sex: "Female",
      age: "5 years",
      weight: "15 kg",
      kennel: "K-03",
      intake: "2023-12-01"
    },
  ];

  // Filtrado
  const filtered = allStaff.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.includes(search) ||
        a.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || a.rol === roleFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Contadores por rol
  const vetCount = allStaff.filter((a) => a.rol === "veterinarian").length;
  const opCount = allStaff.filter((a) => a.rol === "operator").length;
  const coordinatorCount = allStaff.filter((a) => a.rol === "coordinator").length;
  const evaluatorCount = allStaff.filter((a) => a.rol === "evaluator").length;

  // Datos para los botones de filtro por rol
  const roleFilters = [
    { label: "Todo el personal", count: allStaff.length, key: "all", color: "#2E2E2E", bg: "#EDE9E1" },
    { label: "Veterinarios", count: vetCount, key: "veterinarian", color: "#43AE6D", bg: "#EBF7F1" },
    { label: "Operadores", count: opCount, key: "operator", color: "#6B9FAE", bg: "#EAF3F6" },
    { label: "Coordinadores", count: coordinatorCount, key: "coordinator", color: "#E8A87C", bg: "#FDF2EA" },
    { label: "Evaluadores", count: evaluatorCount, key: "evaluator", color: "#7A7670", bg: "#EDE9E1" },
  ];

  return (
      <div className="px-8 py-7">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Personal</h2>
            <p className="text-sm text-muted-foreground mt-1">{allStaff.length} cuentas actualmente activas en el sistema.</p>
          </div>
          <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#43AE6D" }}
              onClick={addStaff}
          >
            <Plus size={15} /> Registrar Personal
          </button>
        </div>

        {/* Filtros por rol */}
        <div className="flex gap-3 mb-7 flex-wrap">
          {roleFilters.map(({ label, count, key, color, bg }) => (
              <button
                  key={key}
                  onClick={() => setRoleFilter(key as typeof roleFilter)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    backgroundColor: roleFilter === key ? bg : "#FFFFFF",
                    color: roleFilter === key ? color : "#7A7670",
                    borderColor: roleFilter === key ? color + "40" : "rgba(46,46,46,0.08)",
                  }}
              >
                {label}
                <span className="ml-1 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
              </button>
          ))}

        </div>

        {/* Tabla */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                  type="text"
                  placeholder="Buscar por nombre, ID o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Personal</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Rol</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fecha Registro</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Modificar</th>
              </tr>
              </thead>
              <tbody>
              {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No se encontró personal que coincida con tu búsqueda.</td>
                  </tr>
              ) : (
                  filtered.map((staff) => (
                      <tr key={staff.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: roleConfig[staff.rol]?.bg || "#EDE9E1" }}>
                          <span className="text-xs font-bold" style={{ color: roleConfig[staff.rol]?.color || "#7A7670" }}>
                            {staff.name.charAt(0)}
                          </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{staff.name}</p>
                              <p className="text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{staff.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{staff.email}</td>
                        <td className="px-4 py-4">
                      <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            color: roleConfig[staff.rol]?.color || "#7A7670",
                            backgroundColor: roleConfig[staff.rol]?.bg || "#EDE9E1"
                          }}
                      >
                        {roleConfig[staff.rol]?.label || staff.rol}
                      </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{staff.intake || "2024-01-01"}</td>
                        <td className="px-4 py-4">
                          <button
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                              title="Editar personal"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                              title="Eliminar personal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 border-t border-border flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length}</span> de <span className="font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{allStaff.length}</span> personal
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button className="px-3 py-1.5 rounded-lg bg-secondary border border-border hover:text-foreground transition-colors">Anterior</button>
              <span className="px-3 py-1.5 rounded-lg font-medium text-foreground" style={{ backgroundColor: "#EBF7F1", color: "#43AE6D" }}>1</span>
              <button className="px-3 py-1.5 rounded-lg bg-secondary border border-border hover:text-foreground transition-colors">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
  );
}