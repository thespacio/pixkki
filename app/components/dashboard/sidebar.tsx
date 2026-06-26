"use client";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-white/10 bg-slate-900 p-4 text-white hidden md:block">
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-wider text-emerald-400">PIXKKI</h2>
        <p className="text-xs text-slate-400">SaaS Albergues</p>
      </div>
      <nav className="space-y-2">
        <div className="rounded-lg bg-emerald-500/10 px-4 py-2 text-emerald-400 font-medium">
          Dashboard
        </div>
        <div className="px-4 py-2 text-slate-400 hover:text-white transition cursor-pointer">
          Animales
        </div>
        <div className="px-4 py-2 text-slate-400 hover:text-white transition cursor-pointer">
          Adopciones
        </div>
      </nav>
    </aside>
  );
}