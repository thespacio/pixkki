"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { AnimalState } from "@/modules/animals/types/animal-state.types";
import { TAMANOS } from "@/modules/animals/types/animales.types";
import {
    countActiveFilters,
    type AnimalFilters,
    type AnimalOrden,
} from "@/modules/animals/filters";

export type ShelterOption = { id: number; nombre: string };

type Props = {
    filters: AnimalFilters;
    onChange: (patch: Partial<AnimalFilters>) => void;
    onClear: () => void;
    estados: AnimalState[];
    /** Solo se muestra el filtro por albergue si hay opciones (superadmin). */
    refugios: ShelterOption[];
    total: number;
    shown: number;
};

const SELECT_CLS =
    "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const LABEL_CLS = "block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1";

const TOGGLES: { key: keyof AnimalFilters; label: string }[] = [
    { key: "soloAdopcion", label: "En adopción" },
    { key: "soloCuarentena", label: "En cuarentena" },
    { key: "soloEsterilizados", label: "Esterilizados" },
    { key: "soloVacunados", label: "Vacunados" },
];

export function AnimalFilterBar({
    filters,
    onChange,
    onClear,
    estados,
    refugios,
    total,
    shown,
}: Props) {
    const active = countActiveFilters(filters);

    return (
        <section aria-label="Filtros de animales" className="mb-6 space-y-4">
            <div className="relative">
                <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                />
                <input
                    type="search"
                    value={filters.search}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Buscar por nombre, raza, color, microchip, lugar de rescate..."
                    aria-label="Buscar animales"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                    <label htmlFor="f-especie" className={LABEL_CLS}>Especie</label>
                    <select
                        id="f-especie"
                        value={filters.especie}
                        onChange={(e) => onChange({ especie: e.target.value as AnimalFilters["especie"] })}
                        className={SELECT_CLS}
                    >
                        <option value="">Todas</option>
                        <option value="Perro">Perros</option>
                        <option value="Gato">Gatos</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="f-sexo" className={LABEL_CLS}>Sexo</label>
                    <select
                        id="f-sexo"
                        value={filters.sexo}
                        onChange={(e) => onChange({ sexo: e.target.value as AnimalFilters["sexo"] })}
                        className={SELECT_CLS}
                    >
                        <option value="">Todos</option>
                        <option value="M">Machos</option>
                        <option value="H">Hembras</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="f-estado" className={LABEL_CLS}>Estado</label>
                    <select
                        id="f-estado"
                        value={filters.estadoId}
                        onChange={(e) => onChange({ estadoId: e.target.value })}
                        className={SELECT_CLS}
                    >
                        <option value="">Todos</option>
                        {estados.map((e) => (
                            <option key={e.idEstado} value={e.idEstado}>
                                {e.nombreEstado}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="f-tamano" className={LABEL_CLS}>Tamaño</label>
                    <select
                        id="f-tamano"
                        value={filters.tamano}
                        onChange={(e) => onChange({ tamano: e.target.value })}
                        className={SELECT_CLS}
                    >
                        <option value="">Todos</option>
                        {TAMANOS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {refugios.length > 0 && (
                    <div>
                        <label htmlFor="f-refugio" className={LABEL_CLS}>Albergue</label>
                        <select
                            id="f-refugio"
                            value={filters.refugioId}
                            onChange={(e) => onChange({ refugioId: e.target.value })}
                            className={SELECT_CLS}
                        >
                            <option value="">Todos</option>
                            {refugios.map((r) => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="f-orden" className={LABEL_CLS}>Ordenar por</label>
                    <select
                        id="f-orden"
                        value={filters.orden}
                        onChange={(e) => onChange({ orden: e.target.value as AnimalOrden })}
                        className={SELECT_CLS}
                    >
                        <option value="recientes">Más recientes</option>
                        <option value="antiguos">Más antiguos</option>
                        <option value="nombre">Nombre (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <SlidersHorizontal size={14} className="text-muted-foreground" aria-hidden="true" />
                {TOGGLES.map(({ key, label }) => {
                    const pressed = filters[key] as boolean;
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => onChange({ [key]: !pressed } as Partial<AnimalFilters>)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                pressed
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}

                <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                    <span role="status" aria-live="polite">
                        Mostrando {shown} de {total}
                    </span>
                    {active > 0 && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium text-foreground hover:bg-secondary"
                        >
                            <X size={12} aria-hidden="true" />
                            Limpiar filtros ({active})
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
