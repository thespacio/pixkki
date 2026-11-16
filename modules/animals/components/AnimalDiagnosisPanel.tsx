"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { createAnimalDiagnosisAction } from "../actions/animal-expediente.actions";
import {
    ESTADOS_GENERALES_SALUD,
    type EstadoGeneralSalud,
} from "../types/animales.types";
import type { AnimalDiagnosis } from "../repositories/animal-diagnosis.repository";

type Props = {
    idAnimal: number;
    canDiagnose: boolean;
    /** Avisa al expediente para recargar la ficha clínica (alertas y línea de tiempo). */
    onSaved?: () => void;
};

type ApiEnvelope<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } };

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

const ESTADO_BADGE: Record<string, string> = {
    Crítico: "bg-red-100 text-red-700",
    Delicado: "bg-orange-100 text-orange-700",
    Estable: "bg-blue-100 text-blue-700",
    Sano: "bg-green-100 text-green-700",
};

function isEstadoGeneral(value: string): value is EstadoGeneralSalud {
    return ESTADOS_GENERALES_SALUD.some((estado) => estado === value);
}

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

async function fetchDiagnoses(idAnimal: number): Promise<AnimalDiagnosis[]> {
    const response = await fetch(`/api/v1/animales/${idAnimal}/diagnosticos`, {
        cache: "no-store",
    });
    const result: ApiEnvelope<{
        diagnosticos: AnimalDiagnosis[];
    }> = await response.json();

    if (!result.success) throw new Error(result.error.message);
    return result.data.diagnosticos;
}

/**
 * Diagnóstico veterinario de ingreso (RF1.3, US07).
 * - Solo veterinario/admin ven el formulario; el servidor vuelve a validar el rol.
 * - Crítico o Delicado exigen observaciones (regla del schema Zod).
 * - RF2.4: el diagnóstico NO define la cuarentena. Todo ingreso permanece en
 *   cuarentena y solo el alta médica la libera; por eso aquí no hay checkbox
 *   de "requiere cuarentena" ni forma de alterar ese estado.
 */
export function AnimalDiagnosisPanel({ idAnimal, canDiagnose, onSaved }: Props) {
    const [diagnosticos, setDiagnosticos] = useState<AnimalDiagnosis[]>([]);
    const [loading, setLoading] = useState(true);
    const [estadoGeneral, setEstadoGeneral] = useState<EstadoGeneralSalud>("Estable");
    const [observaciones, setObservaciones] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const observacionesObligatorias =
        estadoGeneral === "Crítico" || estadoGeneral === "Delicado";

    const load = useCallback(async () => {
        try {
            setDiagnosticos(await fetchDiagnoses(idAnimal));
        } catch {
            setError("No se pudo cargar el historial de diagnósticos.");
        } finally {
            setLoading(false);
        }
    }, [idAnimal]);

    useEffect(() => {
        async function initialLoad() {
            await load();
        }
        void initialLoad();
    }, [load]);

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        if (
            (estadoGeneral === "Crítico" || estadoGeneral === "Delicado") &&
            observaciones.trim().length === 0
        ) {
            setError(
                "Las observaciones médicas son obligatorias cuando el estado es Crítico o Delicado.",
            );
            return;
        }

        setSaving(true);
        const result = await createAnimalDiagnosisAction(idAnimal, {
            estadoGeneral,
            observaciones: observaciones.trim() || undefined,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setOk("Diagnóstico registrado.");
        setObservaciones("");
        setEstadoGeneral("Estable");
        await load();
        onSaved?.();
    }

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
                <form onSubmit={guardar} className="mt-4 space-y-3">
                    <div>
                        <label htmlFor={`estado-${idAnimal}`} className={LABEL_CLS}>
                            Estado general *
                        </label>
                        <select
                            id={`estado-${idAnimal}`}
                            value={estadoGeneral}
                            onChange={(event) => {
                                if (isEstadoGeneral(event.target.value)) {
                                    setEstadoGeneral(event.target.value);
                                }
                            }}
                            className={INPUT_CLS}
                        >
                            {ESTADOS_GENERALES_SALUD.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor={`obs-${idAnimal}`} className={LABEL_CLS}>
                            Observaciones médicas {observacionesObligatorias && "*"}
                        </label>
                        <textarea
                            id={`obs-${idAnimal}`}
                            value={observaciones}
                            onChange={(event) => setObservaciones(event.target.value)}
                            rows={3}
                            maxLength={2000}
                            aria-required={observacionesObligatorias}
                            placeholder="Hallazgos, tratamiento inicial, lesiones…"
                            className={`${INPUT_CLS} resize-none`}
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Obligatorias si el estado es Crítico o Delicado.
                        </p>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                        Todo paciente permanece en cuarentena hasta que se registre el alta
                        médica. El diagnóstico no modifica ese estado.
                    </p>

                    {error && (
                        <p role="status" className="text-xs text-red-600">
                            {error}
                        </p>
                    )}
                    {ok && (
                        <p role="status" className="text-xs text-green-700">
                            {ok}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        ) : (
                            <Stethoscope size={14} aria-hidden="true" />
                        )}
                        Registrar diagnóstico
                    </button>
                </form>
            ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">
                    Solo un veterinario o un administrador puede registrar el diagnóstico.
                </p>
            )}
        </section>
    );
}
