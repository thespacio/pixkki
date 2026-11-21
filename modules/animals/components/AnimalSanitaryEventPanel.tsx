"use client";

// ---------------------------------------------------------------------------
// Vacunación y desparasitación (RF2.2 / RF2.3, US10).
//
// Solo historial: el registro se hace desde un botón + sheet (ver
// `AnimalSanitaryEventSheet`). Aquí no vive ningún formulario permanente.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Syringe } from "lucide-react";
import { getAnimalSanitaryEventsAction } from "../actions/animal-clinical.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENTO_LABEL } from "./AnimalSanitaryEventForm";
import type { AnimalSanitaryEvent } from "../repositories/animal-sanitary-event.repository";

type Props = {
    idAnimal: number;
    canRegister: boolean;
    refreshKey?: number;
    /** Máximo de eventos visibles en el historial. */
    limit?: number;
    /** Abre el sheet de registro desde el estado vacío o el pie del historial. */
    onRequestCreate?: () => void;
    /** Muestra "Ver todos" cuando hay más registros que `limit`. */
    onViewAll?: () => void;
};

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function AnimalSanitaryEventPanel({
    idAnimal,
    canRegister,
    refreshKey = 0,
    limit,
    onRequestCreate,
    onViewAll,
}: Props) {
    const [eventos, setEventos] = useState<AnimalSanitaryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        const result = await getAnimalSanitaryEventsAction(idAnimal);
        if (result.success) {
            setEventos(result.data);
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

    const visibles = limit !== undefined ? eventos.slice(0, limit) : eventos;
    const hayMas = limit !== undefined && eventos.length > limit;

    return (
        <section>
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Vacunación y desparasitación
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
            ) : eventos.length === 0 ? (
                <div className="py-6 text-center">
                    <p className="mb-4 text-xs text-muted-foreground">
                        Aún no hay eventos sanitarios registrados.
                    </p>
                    {canRegister && onRequestCreate ? (
                        <button
                            type="button"
                            onClick={onRequestCreate}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            <Syringe size={14} aria-hidden="true" />
                            Registrar primer evento
                        </button>
                    ) : (
                        <p className="text-[11px] text-muted-foreground">
                            {canRegister
                                ? "Usa el botón «Evento sanitario» para agregar el primero."
                                : "Solo un veterinario o un administrador puede registrar eventos sanitarios."}
                        </p>
                    )}
                </div>
            ) : (
                <ul className="space-y-3">
                    {visibles.map((evento) => (
                        <li
                            key={evento.idEvento}
                            className="rounded-xl border border-border bg-card p-3"
                        >
                            <p className="text-xs font-semibold text-foreground">
                                {EVENTO_LABEL[evento.tipoEvento]} · {evento.tipoBiologico}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Aplicado el {formatFecha(evento.fechaAplicacion)}
                                {evento.marcaLote ? ` · Lote ${evento.marcaLote}` : ""}
                                {evento.fechaRefuerzo
                                    ? ` · Refuerzo ${formatFecha(evento.fechaRefuerzo)}`
                                    : ""}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {evento.esquemaCompleto
                                    ? "Esquema completo"
                                    : "Esquema incompleto"}
                                {evento.cantidadDescontada
                                    ? " · 1 unidad descontada del inventario"
                                    : ""}
                            </p>
                            {evento.observaciones && (
                                <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                                    {evento.observaciones}
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
                    Ver todos ({eventos.length})
                </button>
            )}

            {canRegister && onRequestCreate && eventos.length > 0 && (
                <button
                    type="button"
                    onClick={onRequestCreate}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                    <Plus size={14} aria-hidden="true" />
                    Registrar evento
                </button>
            )}
        </section>
    );
}
