"use client";

// ---------------------------------------------------------------------------
// Formulario de chequeo médico y constantes vitales (RF2.1 / US09).
//
// Se extrajo del panel para reutilizarlo dentro de un sheet: la ficha clínica
// registra chequeos desde un botón, no desde un formulario permanente.
// Los cuatro signos vitales son obligatorios y se validan con los mismos
// rangos del schema Zod; el servidor vuelve a validar.
// ---------------------------------------------------------------------------

import { useId, useState, type FormEvent } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { createAnimalCheckupAction } from "../actions/animal-clinical.actions";
import {
    SINTOMAS_CHEQUEO,
    type SintomaChequeo,
} from "../validators/animal.validators";
import type { AnimalCheckup } from "../repositories/animal-checkup.repository";

export const SINTOMA_LABEL: Record<SintomaChequeo, string> = {
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

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";
const CHECK_CLS = "flex items-center gap-2 cursor-pointer text-sm text-foreground";

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

type Props = {
    idAnimal: number;
    onSaved: (chequeo: AnimalCheckup) => void;
    onCancel?: () => void;
};

export function AnimalCheckupForm({ idAnimal, onSaved, onCancel }: Props) {
    const uid = useId();
    const fieldId = (name: string) => `${uid}-${name}`;
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        setForm(EMPTY_FORM);
        onSaved(result.data);
    }

    return (
        <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor={fieldId("peso")} className={LABEL_CLS}>
                        Peso (kg) *
                    </label>
                    <input
                        id={fieldId("peso")}
                        type="number"
                        step="0.01"
                        min={RANGOS.peso.min}
                        max={RANGOS.peso.max}
                        inputMode="decimal"
                        required
                        value={form.peso}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, peso: e.target.value }))
                        }
                        className={INPUT_CLS}
                    />
                </div>
                <div>
                    <label htmlFor={fieldId("temperatura")} className={LABEL_CLS}>
                        Temperatura (°C) *
                    </label>
                    <input
                        id={fieldId("temperatura")}
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
                    <label htmlFor={fieldId("cardiaca")} className={LABEL_CLS}>
                        Frecuencia cardiaca (lpm) *
                    </label>
                    <input
                        id={fieldId("cardiaca")}
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
                    <label htmlFor={fieldId("respiratoria")} className={LABEL_CLS}>
                        Frecuencia respiratoria (rpm) *
                    </label>
                    <input
                        id={fieldId("respiratoria")}
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
                    <label htmlFor={fieldId("otro")} className={LABEL_CLS}>
                        Detalle del síntoma «Otro» *
                    </label>
                    <input
                        id={fieldId("otro")}
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
                <label htmlFor={fieldId("observaciones")} className={LABEL_CLS}>
                    Observaciones (opcional)
                </label>
                <textarea
                    id={fieldId("observaciones")}
                    value={form.observaciones}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, observaciones: e.target.value }))
                    }
                    rows={3}
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

            <div className="flex items-center justify-end gap-2 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                    {saving ? (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Stethoscope size={14} aria-hidden="true" />
                    )}
                    Registrar chequeo
                </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
                La fecha y hora se registran automáticamente en el servidor.
            </p>
        </form>
    );
}
