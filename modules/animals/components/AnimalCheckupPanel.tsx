"use client";

// ---------------------------------------------------------------------------
// Chequeos médicos (RF2.1 / US09).
//
// Solo historial: el registro se hace desde un botón + sheet (ver
// `AnimalCheckupSheet`). Aquí no vive ningún formulario permanente.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Plus, RefreshCw, Stethoscope } from "lucide-react";
import { getAnimalCheckupsAction } from "../actions/animal-clinical.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { SINTOMA_LABEL } from "./AnimalCheckupForm";
import type { SintomaChequeo } from "../validators/animal.validators";
import type { AnimalCheckup } from "../repositories/animal-checkup.repository";

type Props = {
    idAnimal: number;
    /** Solo veterinario/admin pueden registrar chequeos (el servidor lo revalida). */
    canRegister: boolean;
    refreshKey?: number;
    /** Máximo de chequeos visibles en el historial. */
    limit?: number;
    /** Abre el sheet de registro desde el estado vacío o el pie del historial. */
    onRequestCreate?: () => void;
    /** Muestra "Ver todos" cuando hay más registros que `limit`. */
    onViewAll?: () => void;
};

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function AnimalCheckupPanel({
    idAnimal,
    canRegister,
    refreshKey = 0,
    limit,
    onRequestCreate,
    onViewAll,
}: Props) {
    const [chequeos, setChequeos] = useState<AnimalCheckup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        const result = await getAnimalCheckupsAction(idAnimal);
        if (result.success) {
            setChequeos(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, [idAnimal]);

    useEffect(() => {
        async function initialLoad() {
            await load();
        }
        void initialLoad();
    }, [load, refreshKey]);

    const visibles =
        limit !== undefined ? chequeos.slice(0, limit) : chequeos;
    const hayMas = limit !== undefined && chequeos.length > limit;

    return (
        <section>
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Chequeos médicos
            </h4>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                    <p>{error}</p>
                    <button
                        onClick={load}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
                    >
                        <RefreshCw size={12} aria-hidden="true" /> Reintentar
                    </button>
                </div>
            ) : chequeos.length === 0 ? (
                <div className="py-6 text-center">
                    <p className="mb-4 text-xs text-muted-foreground">
                        Aún no hay chequeos médicos registrados.
                    </p>
                    {canRegister && onRequestCreate ? (
                        <button
                            type="button"
                            onClick={onRequestCreate}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Stethoscope size={14} aria-hidden="true" />
                            Registrar primer chequeo
                        </button>
                    ) : (
                        <p className="text-[11px] text-muted-foreground">
                            {canRegister
                                ? "Usa el botón «Registrar chequeo» para agregar el primero."
                                : "Solo un veterinario o un administrador puede registrar chequeos médicos."}
                        </p>
                    )}
                </div>
            ) : (
                <ul className="space-y-3">
                    {visibles.map((chequeo) => (
                        <li
                            key={chequeo.idChequeo}
                            className="rounded-xl border border-border bg-card p-3"
                        >
                            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <CalendarClock size={12} aria-hidden="true" />
                                {formatFecha(chequeo.fechaChequeo)}
                            </p>
                            <p className="mt-1 text-xs text-foreground">
                                Peso {chequeo.pesoKg} kg · Temp {chequeo.temperaturaC} °C · FC{" "}
                                {chequeo.frecuenciaCardiaca} lpm · FR{" "}
                                {chequeo.frecuenciaRespiratoria} rpm
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {chequeo.sintomas.length === 0
                                    ? "Asintomático."
                                    : `Síntomas: ${chequeo.sintomas
                                          .map((s) => SINTOMA_LABEL[s as SintomaChequeo] ?? s)
                                          .join(", ")}`}
                                {chequeo.sintomaOtroDetalle
                                    ? ` (${chequeo.sintomaOtroDetalle})`
                                    : ""}
                            </p>
                            {chequeo.observaciones && (
                                <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                                    {chequeo.observaciones}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {!loading && !error && hayMas && onViewAll && (
                <button
                    type="button"
                    onClick={onViewAll}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
                >
                    Ver todos ({chequeos.length})
                </button>
            )}

            {canRegister && onRequestCreate && chequeos.length > 0 && (
                <button
                    type="button"
                    onClick={onRequestCreate}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                    <Plus size={14} aria-hidden="true" />
                    Registrar chequeo
                </button>
            )}
        </section>
    );
}
