"use client";

// ---------------------------------------------------------------------------
// Formulario de diagnóstico veterinario de ingreso (RF1.3 / US07).
//
// Extraído de `AnimalDiagnosisPanel` para reutilizarlo en dos lugares sin
// duplicar validación ni lógica: el panel de la ficha clínica y el sheet de la
// ficha rápida del animal. El servicio y el schema Zod siguen siendo la única
// fuente de verdad de las reglas (Crítico/Delicado exigen observaciones).
// ---------------------------------------------------------------------------

import { useId, useState, type FormEvent } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { createAnimalDiagnosisAction } from "../actions/animal-expediente.actions";
import {
    ESTADOS_GENERALES_SALUD,
    type EstadoGeneralSalud,
} from "../types/animales.types";
import type { AnimalDiagnosis } from "../repositories/animal-diagnosis.repository";

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

function isEstadoGeneral(value: string): value is EstadoGeneralSalud {
    return ESTADOS_GENERALES_SALUD.some((estado) => estado === value);
}

type Props = {
    idAnimal: number;
    onSaved: (diagnostico: AnimalDiagnosis) => void;
    onCancel?: () => void;
};

export function AnimalDiagnosisForm({ idAnimal, onSaved, onCancel }: Props) {
    const uid = useId();
    const [estadoGeneral, setEstadoGeneral] =
        useState<EstadoGeneralSalud>("Estable");
    const [observaciones, setObservaciones] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const observacionesObligatorias =
        estadoGeneral === "Crítico" || estadoGeneral === "Delicado";

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        if (observacionesObligatorias && observaciones.trim().length === 0) {
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
        onSaved(result.data);
    }

    return (
        <form onSubmit={guardar} className="space-y-3" noValidate>
            <div>
                <label htmlFor={`${uid}-estado`} className={LABEL_CLS}>
                    Estado general *
                </label>
                <select
                    id={`${uid}-estado`}
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
                <label htmlFor={`${uid}-observaciones`} className={LABEL_CLS}>
                    Observaciones médicas {observacionesObligatorias && "*"}
                </label>
                <textarea
                    id={`${uid}-observaciones`}
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
                <p role="alert" className="text-xs text-red-600">
                    {error}
                </p>
            )}
            {ok && (
                <p role="status" className="text-xs text-green-700">
                    {ok}
                </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
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
                    Registrar diagnóstico
                </button>
            </div>
        </form>
    );
}
