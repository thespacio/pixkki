"use client";

// ---------------------------------------------------------------------------
// Chequeo médico y constantes vitales (RF2.1 / US09).
//
// - Los cuatro signos vitales son obligatorios y se validan en el cliente con
//   los mismos rangos del schema Zod; el servidor vuelve a validar.
// - La lista de síntomas sale de `SINTOMAS_CHEQUEO` (fuente única en
//   `validators/animal.validators.ts`).
// - Solo veterinario/admin ven el formulario; el servidor revalida el rol.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarClock, Loader2, RefreshCw, Stethoscope } from "lucide-react";
import {
    createAnimalCheckupAction,
    getAnimalCheckupsAction,
} from "../actions/animal-clinical.actions";
import { Skeleton } from "@/components/ui/skeleton";
import {
    SINTOMAS_CHEQUEO,
    type SintomaChequeo,
} from "../validators/animal.validators";
import type { AnimalCheckup } from "../repositories/animal-checkup.repository";

type Props = {
    idAnimal: number;
    /** Solo veterinario/admin pueden registrar chequeos (el servidor lo revalida). */
    canRegister: boolean;
    refreshKey?: number;
    onSaved?: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";
const CHECK_CLS = "flex items-center gap-2 cursor-pointer text-sm text-foreground";

const SINTOMA_LABEL: Record<SintomaChequeo, string> = {
    vomito: "Vómito",
    diarrea: "Diarrea",
    letargia: "Letargia",
    secrecion_nasal_ocular: "Secreción nasal/ocular",
    tos: "Tos",
    otro: "Otro",
};

// Mismos rangos clínicos que `CreateChequeoSchema` (RF2.1, regla 2).
const RANGOS = {
    peso: { min: 0.01, max: 200, label: "Peso (kg)" },
    temperatura: { min: 30, max: 45, label: "Temperatura (°C)" },
    cardiaca: { min: 20, max: 300, label: "Frecuencia cardiaca (lpm)" },
    respiratoria: { min: 5, max: 150, label: "Frecuencia respiratoria (rpm)" },
} as const;

type FormState = {
    peso: string;
    temperatura: string;
    cardiaca: string;
    respiratoria: string;
    sintomas: SintomaChequeo[];
    otroDetalle: string;
    observaciones: string;
};

const EMPTY_FORM: FormState = {
    peso: "",
    temperatura: "",
    cardiaca: "",
    respiratoria: "",
    sintomas: [],
    otroDetalle: "",
    observaciones: "",
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

function validarNumero(
    value: string,
    rango: { min: number; max: number; label: string },
    entero = false,
): string | null {
    if (value.trim() === "") return `${rango.label} es obligatorio.`;
    const numero = Number(value);
    if (!Number.isFinite(numero)) return `${rango.label} debe ser numérico.`;
    if (entero && !Number.isInteger(numero)) return `${rango.label} debe ser entero.`;
    if (numero < rango.min || numero > rango.max) {
        return `${rango.label} debe estar entre ${rango.min} y ${rango.max}.`;
    }
    return null;
}

export function AnimalCheckupPanel({
    idAnimal,
    canRegister,
    refreshKey = 0,
    onSaved,
}: Props) {
    const [chequeos, setChequeos] = useState<AnimalCheckup[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

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

    function toggleSintoma(sintoma: SintomaChequeo) {
        setForm((prev) => {
            const activo = prev.sintomas.includes(sintoma);
            const sintomas = activo
                ? prev.sintomas.filter((s) => s !== sintoma)
                : [...prev.sintomas, sintoma];
            return {
                ...prev,
                sintomas,
                otroDetalle: sintomas.includes("otro") ? prev.otroDetalle : "",
            };
        });
    }

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        const validationError =
            validarNumero(form.peso, RANGOS.peso) ??
            validarNumero(form.temperatura, RANGOS.temperatura) ??
            validarNumero(form.cardiaca, RANGOS.cardiaca, true) ??
            validarNumero(form.respiratoria, RANGOS.respiratoria, true);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (form.sintomas.includes("otro") && form.otroDetalle.trim() === "") {
            setError("Debes detallar el síntoma cuando seleccionas «Otro».");
            return;
        }

        setSaving(true);
        const result = await createAnimalCheckupAction(idAnimal, {
            peso_kg: Number(form.peso),
            temperatura_c: Number(form.temperatura),
            frecuencia_cardiaca: Number(form.cardiaca),
            frecuencia_respiratoria: Number(form.respiratoria),
            sintomas: form.sintomas,
            sintoma_otro_detalle:
                form.sintomas.includes("otro") ? form.otroDetalle.trim() : null,
            observaciones: form.observaciones.trim() || null,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setChequeos((prev) => [result.data, ...prev]);
        setForm(EMPTY_FORM);
        setOk("Chequeo registrado. El peso vigente del paciente se actualizó.");
        onSaved?.();
    }

    return (
        <section className="mt-6">
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
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs">
                    <p>{error}</p>
                    <button
                        onClick={load}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
                    >
                        <RefreshCw size={12} aria-hidden="true" /> Reintentar
                    </button>
                </div>
            ) : chequeos.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground mb-4">
                        Aún no hay chequeos médicos registrados.
                    </p>
                    {!canRegister ? (
                        <p className="text-[11px] text-muted-foreground">
                            Solo un veterinario o un administrador puede registrar
                            chequeos médicos.
                        </p>
                    ) : (
                        <button
                            onClick={() => {
                                // El formulario está debajo; scroll suave al formulario.
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                        >
                            <Stethoscope size={14} aria-hidden="true" />
                            Registrar primer chequeo
                        </button>
                    )}
                </div>
            ) : (
                <ul className="space-y-3">
                    {chequeos.map((chequeo) => (
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

            {!canRegister && error && (
                <p role="status" className="mt-3 text-xs text-red-600">
                    {error}
                </p>
            )}

            {canRegister ? (
                <form onSubmit={guardar} className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor={`peso-${idAnimal}`} className={LABEL_CLS}>
                                Peso (kg) *
                            </label>
                            <input
                                id={`peso-${idAnimal}`}
                                type="number"
                                step="0.01"
                                min={RANGOS.peso.min}
                                max={RANGOS.peso.max}
                                inputMode="decimal"
                                required
                                value={form.peso}
                                onChange={(e) => setForm((p) => ({ ...p, peso: e.target.value }))}
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label htmlFor={`temp-${idAnimal}`} className={LABEL_CLS}>
                                Temperatura (°C) *
                            </label>
                            <input
                                id={`temp-${idAnimal}`}
                                type="number"
                                step="0.1"
                                min={RANGOS.temperatura.min}
                                max={RANGOS.temperatura.max}
                                inputMode="decimal"
                                required
                                value={form.temperatura}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, temperatura: e.target.value }))
                                }
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label htmlFor={`fc-${idAnimal}`} className={LABEL_CLS}>
                                Frecuencia cardiaca (lpm) *
                            </label>
                            <input
                                id={`fc-${idAnimal}`}
                                type="number"
                                step="1"
                                min={RANGOS.cardiaca.min}
                                max={RANGOS.cardiaca.max}
                                inputMode="numeric"
                                required
                                value={form.cardiaca}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, cardiaca: e.target.value }))
                                }
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label htmlFor={`fr-${idAnimal}`} className={LABEL_CLS}>
                                Frecuencia respiratoria (rpm) *
                            </label>
                            <input
                                id={`fr-${idAnimal}`}
                                type="number"
                                step="1"
                                min={RANGOS.respiratoria.min}
                                max={RANGOS.respiratoria.max}
                                inputMode="numeric"
                                required
                                value={form.respiratoria}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, respiratoria: e.target.value }))
                                }
                                className={INPUT_CLS}
                            />
                        </div>
                    </div>

                    <fieldset>
                        <legend className={LABEL_CLS}>Síntomas observados</legend>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                            {SINTOMAS_CHEQUEO.map((sintoma) => (
                                <label key={sintoma} className={CHECK_CLS}>
                                    <input
                                        type="checkbox"
                                        checked={form.sintomas.includes(sintoma)}
                                        onChange={() => toggleSintoma(sintoma)}
                                        className="size-4 rounded border-input accent-primary"
                                    />
                                    {SINTOMA_LABEL[sintoma]}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {form.sintomas.includes("otro") && (
                        <div>
                            <label htmlFor={`otro-${idAnimal}`} className={LABEL_CLS}>
                                Detalle del síntoma «Otro» *
                            </label>
                            <input
                                id={`otro-${idAnimal}`}
                                value={form.otroDetalle}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, otroDetalle: e.target.value }))
                                }
                                maxLength={300}
                                required
                                className={INPUT_CLS}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor={`obs-chequeo-${idAnimal}`} className={LABEL_CLS}>
                            Observaciones (opcional)
                        </label>
                        <textarea
                            id={`obs-chequeo-${idAnimal}`}
                            value={form.observaciones}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, observaciones: e.target.value }))
                            }
                            rows={2}
                            maxLength={2000}
                            placeholder="Hallazgos adicionales, conducta, indicaciones…"
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
                            <Stethoscope size={14} aria-hidden="true" />
                        )}
                        Registrar chequeo
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        La fecha y hora se registran automáticamente en el servidor.
                    </p>
                </form>
            ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">
                    Solo un veterinario o un administrador puede registrar chequeos médicos.
                </p>
            )}
        </section>
    );
}
