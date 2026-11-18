"use client";

// RF3.3 — evaluación de temperamento y compatibilidad (US13).
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Smile } from "lucide-react";
import {
    createAnimalTemperamentEvaluationAction,
    getAnimalTemperamentEvaluationsAction,
} from "../actions/animal-socialization.actions";
import {
    APTITUDES,
    COMPORTAMIENTOS,
    NIVELES_ENERGIA,
    type Aptitud,
    type Comportamiento,
    type NivelEnergia,
} from "../validators/animal-temperament.validators";
import type { TemperamentEvaluation } from "../repositories/animal-temperament.repository";

type Props = {
    idAnimal: number;
    canRegister: boolean;
    onSaved?: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

const APTITUD_LABEL: Record<Aptitud, string> = {
    si: "Sí",
    no: "No",
    con_supervision: "Con supervisión",
};

type FormState = {
    comportamiento: Comportamiento | "";
    nivelEnergia: NivelEnergia | "";
    aptoPerros: Aptitud | "";
    aptoGatos: Aptitud | "";
    aptoNinos: Aptitud | "";
};

const EMPTY_FORM: FormState = {
    comportamiento: "",
    nivelEnergia: "",
    aptoPerros: "",
    aptoGatos: "",
    aptoNinos: "",
};

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function AnimalTemperamentPanel({ idAnimal, canRegister, onSaved }: Props) {
    const [evaluaciones, setEvaluaciones] = useState<TemperamentEvaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const load = useCallback(async () => {
        const result = await getAnimalTemperamentEvaluationsAction(idAnimal);
        if (result.success) setEvaluaciones(result.data);
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

        if (
            !form.comportamiento ||
            !form.nivelEnergia ||
            !form.aptoPerros ||
            !form.aptoGatos ||
            !form.aptoNinos
        ) {
            setError("Completa todos los campos de la evaluación.");
            return;
        }

        setSaving(true);
        const result = await createAnimalTemperamentEvaluationAction(idAnimal, {
            comportamiento: form.comportamiento,
            nivel_energia: form.nivelEnergia,
            apto_perros: form.aptoPerros,
            apto_gatos: form.aptoGatos,
            apto_ninos: form.aptoNinos,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }
        setEvaluaciones((prev) => [result.data, ...prev]);
        setForm(EMPTY_FORM);
        setOk(`Evaluación registrada. Temperamento vigente: ${result.data.temperamentoVigente ?? "—"}.`);
        onSaved?.();
    }

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Temperamento y compatibilidad
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando evaluaciones…
                </p>
            ) : evaluaciones.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aún no hay evaluaciones registradas.</p>
            ) : (
                <ul className="space-y-2">
                    {evaluaciones.map((evaluacion) => (
                        <li key={evaluacion.idEvaluacion} className="rounded-xl border border-border bg-card p-3">
                            <p className="text-xs font-semibold text-foreground">
                                {evaluacion.comportamiento} · Energía {evaluacion.nivelEnergia}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Perros: {APTITUD_LABEL[evaluacion.aptoPerros as Aptitud] ?? evaluacion.aptoPerros} ·
                                Gatos: {APTITUD_LABEL[evaluacion.aptoGatos as Aptitud] ?? evaluacion.aptoGatos} ·
                                Niños: {APTITUD_LABEL[evaluacion.aptoNinos as Aptitud] ?? evaluacion.aptoNinos}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {formatFecha(evaluacion.fechaEvaluacion)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {canRegister ? (
                <form onSubmit={guardar} className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label htmlFor={`comportamiento-${idAnimal}`} className={LABEL_CLS}>
                                Comportamiento *
                            </label>
                            <select
                                id={`comportamiento-${idAnimal}`}
                                value={form.comportamiento}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        comportamiento: e.target.value as Comportamiento,
                                    }))
                                }
                                required
                                className={INPUT_CLS}
                            >
                                <option value="">Selecciona</option>
                                {COMPORTAMIENTOS.map((valor) => (
                                    <option key={valor} value={valor}>
                                        {valor}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`energia-${idAnimal}`} className={LABEL_CLS}>
                                Nivel de energía *
                            </label>
                            <select
                                id={`energia-${idAnimal}`}
                                value={form.nivelEnergia}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        nivelEnergia: e.target.value as NivelEnergia,
                                    }))
                                }
                                required
                                className={INPUT_CLS}
                            >
                                <option value="">Selecciona</option>
                                {NIVELES_ENERGIA.map((valor) => (
                                    <option key={valor} value={valor}>
                                        {valor}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {(["aptoPerros", "aptoGatos", "aptoNinos"] as const).map((campo) => (
                            <div key={campo}>
                                <label htmlFor={`${campo}-${idAnimal}`} className={LABEL_CLS}>
                                    {campo === "aptoPerros"
                                        ? "Apto con perros *"
                                        : campo === "aptoGatos"
                                            ? "Apto con gatos *"
                                            : "Apto con niños *"}
                                </label>
                                <select
                                    id={`${campo}-${idAnimal}`}
                                    value={form[campo]}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, [campo]: e.target.value as Aptitud }))
                                    }
                                    required
                                    className={INPUT_CLS}
                                >
                                    <option value="">Selecciona</option>
                                    {APTITUDES.map((valor) => (
                                        <option key={valor} value={valor}>
                                            {APTITUD_LABEL[valor]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
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
                            <Smile size={14} aria-hidden="true" />
                        )}
                        Registrar evaluación
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
                        Solo un evaluador, veterinario o administrador puede registrar evaluaciones.
                    </p>
                </>
            )}
        </section>
    );
}
