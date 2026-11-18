"use client";

// RF3.4 — bitácora de rehabilitación física y emocional (US14).
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Activity, Loader2 } from "lucide-react";
import {
    createAnimalRehabilitationAction,
    getAnimalRehabilitationsAction,
} from "../actions/animal-socialization.actions";
import {
    TIPOS_REHABILITACION,
    type TipoRehabilitacion,
} from "../validators/animal-rehabilitation.validators";
import { hoyLocalISO } from "../validators/animal.validators";
import type { RehabilitationEntry } from "../repositories/animal-rehabilitation.repository";

type Props = {
    idAnimal: number;
    canRegister: boolean;
    onSaved?: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

const TIPO_LABEL: Record<TipoRehabilitacion, string> = {
    fisica: "Física",
    emocional: "Emocional",
    conductual: "Conductual",
};

type FormState = {
    tipo: TipoRehabilitacion | "";
    fechaInicio: string;
    fechaFin: string;
    objetivo: string;
    observaciones: string;
};

function emptyForm(): FormState {
    return {
        tipo: "",
        fechaInicio: hoyLocalISO(),
        fechaFin: "",
        objetivo: "",
        observaciones: "",
    };
}

export function AnimalRehabilitationPanel({ idAnimal, canRegister, onSaved }: Props) {
    const [entradas, setEntradas] = useState<RehabilitationEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const load = useCallback(async () => {
        const result = await getAnimalRehabilitationsAction(idAnimal);
        if (result.success) setEntradas(result.data);
        else setError(result.error);
    }, [idAnimal]);

    useEffect(() => {
        let activo = true;
        async function initialLoad() {
            await load();
            if (activo) setLoading(false);
        }
        void initialLoad();
        return () => {
            activo = false;
        };
    }, [load]);

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        if (!form.tipo || form.objetivo.trim() === "" || !form.fechaInicio) {
            setError("Tipo, fecha de inicio y objetivo son obligatorios.");
            return;
        }
        if (form.fechaFin && form.fechaFin < form.fechaInicio) {
            setError("La fecha de fin no puede ser anterior a la de inicio.");
            return;
        }

        setSaving(true);
        const result = await createAnimalRehabilitationAction(idAnimal, {
            tipo: form.tipo,
            fecha_inicio: form.fechaInicio,
            fecha_fin: form.fechaFin || null,
            objetivo: form.objetivo.trim(),
            observaciones: form.observaciones.trim() || null,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }
        setEntradas((prev) => [result.data, ...prev]);
        setForm(emptyForm());
        setOk("Entrada de rehabilitación registrada.");
        onSaved?.();
    }

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Rehabilitación
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando bitácora…
                </p>
            ) : entradas.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aún no hay entradas de rehabilitación.</p>
            ) : (
                <ul className="space-y-2">
                    {entradas.map((entrada) => (
                        <li key={entrada.idRehabilitacion} className="rounded-xl border border-border bg-card p-3">
                            <p className="text-xs font-semibold text-foreground">
                                {TIPO_LABEL[entrada.tipo as TipoRehabilitacion] ?? entrada.tipo} · {entrada.objetivo}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {entrada.fechaInicio}
                                {entrada.fechaFin ? ` → ${entrada.fechaFin}` : " · en curso"}
                            </p>
                            {entrada.observaciones && (
                                <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                                    {entrada.observaciones}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canRegister ? (
                <form onSubmit={guardar} className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label htmlFor={`tipo-rehab-${idAnimal}`} className={LABEL_CLS}>
                                Tipo *
                            </label>
                            <select
                                id={`tipo-rehab-${idAnimal}`}
                                value={form.tipo}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, tipo: e.target.value as TipoRehabilitacion }))
                                }
                                required
                                className={INPUT_CLS}
                            >
                                <option value="">Selecciona</option>
                                {TIPOS_REHABILITACION.map((valor) => (
                                    <option key={valor} value={valor}>
                                        {TIPO_LABEL[valor]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`inicio-rehab-${idAnimal}`} className={LABEL_CLS}>
                                Fecha de inicio *
                            </label>
                            <input
                                id={`inicio-rehab-${idAnimal}`}
                                type="date"
                                max={hoyLocalISO()}
                                value={form.fechaInicio}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, fechaInicio: e.target.value }))
                                }
                                required
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label htmlFor={`fin-rehab-${idAnimal}`} className={LABEL_CLS}>
                                Fecha de fin (opcional)
                            </label>
                            <input
                                id={`fin-rehab-${idAnimal}`}
                                type="date"
                                min={form.fechaInicio}
                                value={form.fechaFin}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, fechaFin: e.target.value }))
                                }
                                className={INPUT_CLS}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor={`objetivo-rehab-${idAnimal}`} className={LABEL_CLS}>
                            Objetivo *
                        </label>
                        <input
                            id={`objetivo-rehab-${idAnimal}`}
                            value={form.objetivo}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, objetivo: e.target.value }))
                            }
                            maxLength={500}
                            required
                            className={INPUT_CLS}
                        />
                    </div>
                    <div>
                        <label htmlFor={`obs-rehab-${idAnimal}`} className={LABEL_CLS}>
                            Observaciones (opcional)
                        </label>
                        <textarea
                            id={`obs-rehab-${idAnimal}`}
                            value={form.observaciones}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, observaciones: e.target.value }))
                            }
                            rows={2}
                            maxLength={2000}
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
                            <Activity size={14} aria-hidden="true" />
                        )}
                        Registrar entrada
                    </button>
                </form>
            ) : (
                <>
                    {error && (
                        <p role="status" className="mt-3 text-xs text-red-600">
                            {error}
                        </p>
                    )}
                    <p className="mt-3 text-[11px] text-muted-foreground">
                        Solo un evaluador, veterinario o administrador puede registrar rehabilitación.
                    </p>
                </>
            )}
        </section>
    );
}
