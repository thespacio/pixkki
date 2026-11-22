"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAnimalSurgeriesAction } from "../actions/animal-poblacional.actions";
import type { AnimalSurgeryHistoryItem } from "../repositories/animal-surgery.repository";
import { AnimalSurgeryForm } from "./AnimalSurgeryForm";
import { AnimalSurgeryHistoryList } from "./AnimalSurgeryHistoryList";

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

type Props = {
    idAnimal: number;
    canOperate: boolean;
    esterilizado: boolean;
    refreshKey?: number;
    onChanged?: () => void;
};

export function AnimalSurgeryPanel({
    idAnimal,
    canOperate,
    esterilizado,
    refreshKey = 0,
    onChanged,
}: Props) {
    const [cirugias, setCirugias] = useState<AnimalSurgeryHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        setHistoryError(null);
        const result = await getAnimalSurgeriesAction(idAnimal);
        if (result.success) {
            setCirugias(result.data);
        } else {
            setHistoryError(result.error);
        }
        setLoading(false);
    }, [idAnimal]);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            setLoading(true);
            setHistoryError(null);
            const result = await getAnimalSurgeriesAction(idAnimal);
            if (cancelled) return;
            if (result.success) {
                setCirugias(result.data);
            } else {
                setHistoryError(result.error);
            }
            setLoading(false);
        }
        void run();
        return () => {
            cancelled = true;
        };
    }, [idAnimal, refreshKey, reloadTick]);

    const ultimaCirugia = cirugias[0];

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Cirugías reproductivas</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Registro append-only del procedimiento quirúrgico y consumo de insumos.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={esterilizado ? "secondary" : "outline"}
                            className={
                                esterilizado
                                    ? "border-green-200 bg-green-100 text-green-700"
                                    : ""
                            }
                        >
                            {esterilizado ? "Esterilizado" : "No esterilizado"}
                        </Badge>
                        {ultimaCirugia ? (
                            <span className="text-xs text-muted-foreground">
                                Última cirugía: {formatFecha(ultimaCirugia.fechaCirugia)}
                            </span>
                        ) : null}
                    </div>
                </div>

                {!canOperate && (
                    <p className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                        Solo lectura: tu rol no permite registrar cirugías.
                    </p>
                )}

                {canOperate && (
                    <div className="mt-4">
                        <h3 className="mb-3 text-sm font-medium text-foreground">Registrar cirugía</h3>
                        <AnimalSurgeryForm
                            idAnimal={idAnimal}
                            onSaved={() => {
                                void load();
                                onChanged?.();
                            }}
                        />
                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Una cirugía registrada no se edita ni se elimina.
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Historial de cirugías</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Eventos quirúrgicos registrados para este paciente.
                        </p>
                    </div>
                    {historyError && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setReloadTick((t) => t + 1)}
                        >
                            <RefreshCw size={14} aria-hidden="true" />
                            Reintentar
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-3" aria-hidden="true">
                        <div className="h-24 animate-pulse rounded-xl bg-muted" />
                        <div className="h-24 animate-pulse rounded-xl bg-muted" />
                        <div className="h-24 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : historyError ? (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-medium">No se pudo cargar el historial de cirugías.</p>
                            <p className="text-xs text-red-600">{historyError}</p>
                        </div>
                    </div>
                ) : (
                    <AnimalSurgeryHistoryList cirugias={cirugias} />
                )}
            </div>
        </section>
    );
}
