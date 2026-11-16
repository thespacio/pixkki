"use client";

// ---------------------------------------------------------------------------
// Control de aislamiento y alta médica (RF2.4 / US11).
//
// Reglas de presentación:
// - Mientras `en_cuarentena = true` se muestra la alerta roja con texto
//   explícito (no solo color) y NO se ofrece ningún control para "salir" de la
//   cuarentena salvo el alta médica.
// - Solo veterinario/admin ven el formulario de alta. El servidor lo revalida.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Loader2, ShieldCheck, ShieldPlus } from "lucide-react";
import {
    getAnimalQuarantineStatusAction,
    releaseAnimalQuarantineAction,
} from "../actions/animal-clinical.actions";
import type {
    QuarantineRelease,
    QuarantineStatus,
} from "../repositories/animal-quarantine.repository";

type Props = {
    idAnimal: number;
    /** Solo veterinario/admin pueden registrar el alta (el servidor lo revalida). */
    canRelease: boolean;
    /** Cambia cuando otro panel modifica el expediente. */
    refreshKey?: number;
    /** Avisa al expediente para recargar la ficha clínica y el listado. */
    onChanged?: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function AnimalQuarantinePanel({
    idAnimal,
    canRelease,
    refreshKey = 0,
    onChanged,
}: Props) {
    const [status, setStatus] = useState<QuarantineStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [observaciones, setObservaciones] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const load = useCallback(async () => {
        const result = await getAnimalQuarantineStatusAction(idAnimal);
        if (result.success) {
            setStatus(result.data);
            setError(null);
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

    async function registrarAlta(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        if (observaciones.trim().length === 0) {
            setError("Las observaciones clínicas son obligatorias para registrar el alta.");
            return;
        }

        setSaving(true);
        const result = await releaseAnimalQuarantineAction(idAnimal, {
            observaciones: observaciones.trim(),
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        const alta: QuarantineRelease = {
            idAlta: result.data.idAlta,
            idAnimal: result.data.idAnimal,
            idRefugio: result.data.idRefugio,
            observaciones: result.data.observaciones,
            idUsuarioVeterinario: result.data.idUsuarioVeterinario,
            fechaAlta: result.data.fechaAlta,
        };

        setStatus((prev) =>
            prev
                ? {
                      ...prev,
                      enCuarentena: false,
                      alerta: null,
                      alta,
                      historialAltas: [alta, ...prev.historialAltas],
                  }
                : prev,
        );
        setObservaciones("");
        setOk("Alta médica registrada. El paciente sale de cuarentena.");
        onChanged?.();
    }

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Control de cuarentena
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Consultando cuarentena…
                </p>
            ) : status ? (
                <>
                    {status.enCuarentena ? (
                        <div
                            role="status"
                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800"
                        >
                            <p className="flex items-center gap-2 text-sm font-semibold">
                                <AlertTriangle size={16} aria-hidden="true" />
                                {status.alerta?.texto ?? "AISLAMIENTO / RIESGO BIOLÓGICO"}
                            </p>
                            <p className="mt-1 text-xs">
                                Ingreso: {formatFecha(status.fechaIngreso)}. No se permite el
                                traslado a áreas generales hasta registrar el alta médica.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                            <p className="flex items-center gap-2 text-sm font-semibold">
                                <ShieldCheck size={16} aria-hidden="true" />
                                Cuarentena finalizada
                            </p>
                            {status.alta && (
                                <p className="mt-1 text-xs">
                                    Alta del {formatFecha(status.alta.fechaAlta)}:{" "}
                                    {status.alta.observaciones}
                                </p>
                            )}
                        </div>
                    )}

                    {status.enCuarentena && canRelease && (
                        <form onSubmit={registrarAlta} className="mt-4 space-y-3">
                            <div>
                                <label htmlFor={`alta-obs-${idAnimal}`} className={LABEL_CLS}>
                                    Observaciones clínicas del alta *
                                </label>
                                <textarea
                                    id={`alta-obs-${idAnimal}`}
                                    value={observaciones}
                                    onChange={(event) => setObservaciones(event.target.value)}
                                    rows={3}
                                    maxLength={2000}
                                    required
                                    aria-required="true"
                                    placeholder="Justificación clínica: evolución, ausencia de síntomas, indicación veterinaria…"
                                    className={`${INPUT_CLS} resize-none`}
                                />
                            </div>

                            {error && (
                                <p role="alert" className="text-xs text-red-600">
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
                                    <ShieldPlus size={14} aria-hidden="true" />
                                )}
                                Registrar alta médica
                            </button>
                            <p className="text-[11px] text-muted-foreground">
                                El alta es definitiva y queda registrada con tu usuario y la fecha.
                            </p>
                        </form>
                    )}

                    {status.enCuarentena && !canRelease && (
                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Solo un veterinario o un administrador puede registrar el alta médica.
                        </p>
                    )}

                    {!status.enCuarentena && !status.alta && (
                        <p className="mt-3 text-[11px] text-muted-foreground">
                            No hay altas registradas para este paciente.
                        </p>
                    )}

                    {status.historialAltas.length > 1 && (
                        <div className="mt-4">
                            <h5 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Historial de altas
                            </h5>
                            <ul className="space-y-2">
                                {status.historialAltas.map((alta) => (
                                    <li
                                        key={alta.idAlta}
                                        className="rounded-lg border border-border px-3 py-2 text-xs"
                                    >
                                        <p className="text-[11px] text-muted-foreground">
                                            {formatFecha(alta.fechaAlta)}
                                        </p>
                                        <p className="text-foreground">{alta.observaciones}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <p role="status" className="text-xs text-red-600">
                    {error ?? "No se pudo consultar el estado de cuarentena."}
                </p>
            )}
        </section>
    );
}
