import React from "react";

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>; // ◄ Cambiado para aceptar el componente del ícono directamente
};

export function KpiCard({ title, value, description, icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-white shadow-md backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h4 className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </h4>
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Icon className="h-6 w-6" /> {/* ◄ Se renderiza como componente de React */}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-4 text-xs text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}