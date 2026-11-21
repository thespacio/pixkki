"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
    getAnimalDiagnosesAction,
} from "../actions/animal-expediente.actions";
import { AnimalDiagnosisForm } from "./AnimalDiagnosisForm";
import type { AnimalDiagnosis } from "../repositories/animal-diagnosis.repository";

type Props = {
    idAnimal: number;
    canDiagnose: boolean;
    /** Avisa al expediente para recargar la ficha clínica (alertas y línea de tiempo). */
    onSaved?: () => void;
};

const ESTADO_BADGE: Record<string, string> = {
    Crítico: "bg-red-100 text-red-700",
    Delicado: "bg-orange-100 text-orange-700",
    Estable: "bg-blue-100 text-blue-700",
    Sano: "bg-green-100 text-green-700",
};

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/**
 * Diagnóstico veterinario de ingreso (RF1.3, US07).
 * - Solo veterinario/admin ven el formulario; el servidor vuelve a validar el rol.
 * - Crítico o Delicado exigen observaciones (regla del schema Zod).
 * - RF2.4: el diagnóstico NO define la cuarentena. Todo ingreso permanece en
 *   cuarentena y solo el alta médica la libera.
 */
export function AnimalDiagnosisPanel({ idAnimal, canDiagnose, onSaved }: Props) {
    const [diagnosticos, setDiagnosticos] = useState<AnimalDiagnosis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        const result = await getAnimalDiagnosesAction(idAnimal);
        if (result.success) setDiagnosticos(result.data);
        else setError(result.error);
        setLoading(false);
    }, [idAnimal]);

    useEffect(() => {
        async function initialLoad() {
            await load();
        }
        void initialLoad();
    }, [load]);

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Diagnóstico de ingreso
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando diagnósticos…
                </p>
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
            ) : diagnosticos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Sin diagnóstico veterinario registrado.
                </p>
            ) : (
                <ul className="space-y-3">
                    {diagnosticos.map((diagnostico) => (
                        <li
                            key={diagnostico.idDiagnostico}
                            className="rounded-xl border border-border bg-card p-3"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                        ESTADO_BADGE[diagnostico.estadoGeneral] ??
                                        "bg-secondary text-foreground"
                                    }`}
                                >
                                    {diagnostico.estadoGeneral}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {formatFecha(diagnostico.fechaDiagnostico)}
                                </span>
                            </div>

                            {diagnostico.requiereCuarentena && (
                                <p className="mt-2 text-[11px] font-medium text-orange-700">
                                    Requiere cuarentena
                                </p>
                            )}

                            {diagnostico.observaciones && (
                                <p className="mt-2 whitespace-pre-line text-xs text-foreground">
                                    {diagnostico.observaciones}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canDiagnose ? (
                <div className="mt-4 border-t border-border pt-4">
                    <AnimalDiagnosisForm
                        idAnimal={idAnimal}
                        onSaved={() => {
                            void load();
                            onSaved?.();
                        }}
                    />
                </div>
            ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">
                    Solo un veterinario o un administrador puede registrar el diagnóstico.
                </p>
            )}
        </section>
    );
}
