"use client";

// ---------------------------------------------------------------------------
// Formulario de vacunación y desparasitación (RF2.2 / RF2.3, US10).
//
// Se extrajo del panel para registrarlo dentro de un sheet. El usuario elige un
// lote con stock real del refugio; la Server Action valida con Zod y la RPC
// descuenta exactamente 1 unidad en la misma transacción.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Loader2, Syringe } from "lucide-react";
import {
    createAnimalSanitaryEventAction,
    getAvailableInventoryLotsAction,
} from "../actions/animal-clinical.actions";
import { hoyLocalISO } from "../validators/animal.validators";
import {
    TIPOS_EVENTO_SANITARIO,
    type TipoEventoSanitario,
} from "../validators/animal-sanitary-event.validators";
import type { AnimalSanitaryEvent } from "../repositories/animal-sanitary-event.repository";
import type { InventoryLot } from "@/modules/inventory/types/inventory.types";

export const EVENTO_LABEL: Record<TipoEventoSanitario, string> = {
    vacunacion: "Vacunación",
    desparasitacion: "Desparasitación",
};

const TIPO_INSUMO: Record<TipoEventoSanitario, "vacuna" | "desparasitante"> = {
    vacunacion: "vacuna",
    desparasitacion: "desparasitante",
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

type FormState = {
    tipoEvento: TipoEventoSanitario;
    tipoBiologico: string;
    fechaAplicacion: string;
    marcaLote: string;
    fechaRefuerzo: string;
    esquemaCompleto: boolean;
    idLote: string;
    observaciones: string;
};

function emptyForm(): FormState {
    return {
        tipoEvento: "vacunacion",
        tipoBiologico: "",
        fechaAplicacion: hoyLocalISO(),
        marcaLote: "",
        fechaRefuerzo: "",
        esquemaCompleto: false,
        idLote: "",
        observaciones: "",
    };
}

function etiquetaLote(lote: InventoryLot): string {
    const detalle = [lote.nombreInsumo, lote.marca, lote.lote]
        .filter(Boolean)
        .join(" · ");
    return `${detalle} (${lote.stockActual} ${lote.unidadMedida} disponibles)`;
}

type Props = {
    idAnimal: number;
    onSaved: (evento: AnimalSanitaryEvent) => void;
    onCancel?: () => void;
};

export function AnimalSanitaryEventForm({ idAnimal, onSaved, onCancel }: Props) {
    const uid = useId();
    const fieldId = (name: string) => `${uid}-${name}`;
    const [lotes, setLotes] = useState<InventoryLot[]>([]);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLots = useCallback(async (tipo: TipoEventoSanitario) => {
        const result = await getAvailableInventoryLotsAction(TIPO_INSUMO[tipo]);
        if (result.success) {
            setLotes(result.data);
            setForm((prev) => ({
                ...prev,
                idLote: result.data.some(
                    (l) => String(l.idLoteInventario) === prev.idLote,
                )
                    ? prev.idLote
                    : "",
            }));
        } else {
            setError(result.error);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => void loadLots(form.tipoEvento), 0);
        return () => clearTimeout(timer);
    }, [form.tipoEvento, loadLots]);

    function changeTipo(tipo: TipoEventoSanitario) {
        setForm((prev) => ({
            ...prev,
            tipoEvento: tipo,
            idLote: "",
            tipoBiologico: "",
            marcaLote: "",
        }));
        setError(null);
    }

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!form.tipoBiologico.trim()) {
            setError("El tipo de biológico o producto es obligatorio.");
            return;
        }
        if (!form.idLote) {
            setError("Selecciona un lote con stock disponible.");
            return;
        }
        if (form.esquemaCompleto && !form.fechaRefuerzo) {
            setError("Un esquema completo requiere fecha de refuerzo.");
            return;
        }
        if (form.fechaRefuerzo && form.fechaRefuerzo <= form.fechaAplicacion) {
            setError("La fecha de refuerzo debe ser posterior a la de aplicación.");
            return;
        }

        setSaving(true);
        const result = await createAnimalSanitaryEventAction(idAnimal, {
            tipo_evento: form.tipoEvento,
            tipo_biologico: form.tipoBiologico.trim(),
            fecha_aplicacion: form.fechaAplicacion,
            marca_lote: form.marcaLote.trim() || null,
            fecha_refuerzo: form.fechaRefuerzo || null,
            esquema_completo: form.esquemaCompleto,
            id_lote_inventario: Number(form.idLote),
            observaciones: form.observaciones.trim() || null,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setForm({ ...emptyForm(), tipoEvento: form.tipoEvento });
        onSaved(result.data);
    }

    return (
        <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor={fieldId("tipo")} className={LABEL_CLS}>
                        Tipo de evento *
                    </label>
                    <select
                        id={fieldId("tipo")}
                        value={form.tipoEvento}
                        onChange={(e) =>
                            changeTipo(e.target.value as TipoEventoSanitario)
                        }
                        className={INPUT_CLS}
                    >
                        {TIPOS_EVENTO_SANITARIO.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {EVENTO_LABEL[tipo]}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor={fieldId("biologico")} className={LABEL_CLS}>
                        Biológico o producto *
                    </label>
                    <input
                        id={fieldId("biologico")}
                        value={form.tipoBiologico}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, tipoBiologico: e.target.value }))
                        }
                        maxLength={120}
                        required
                        className={INPUT_CLS}
                        placeholder="Ej. Rabia, Desparasitante interno"
                    />
                </div>
                <div>
                    <label htmlFor={fieldId("fecha-aplicacion")} className={LABEL_CLS}>
                        Fecha de aplicación *
                    </label>
                    <input
                        id={fieldId("fecha-aplicacion")}
                        type="date"
                        max={hoyLocalISO()}
                        value={form.fechaAplicacion}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, fechaAplicacion: e.target.value }))
                        }
                        required
                        className={INPUT_CLS}
                    />
                </div>
                <div>
                    <label htmlFor={fieldId("marca-lote")} className={LABEL_CLS}>
                        Marca / lote comercial (opcional)
                    </label>
                    <input
                        id={fieldId("marca-lote")}
                        value={form.marcaLote}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, marcaLote: e.target.value }))
                        }
                        maxLength={120}
                        className={INPUT_CLS}
                    />
                </div>
                <div>
                    <label htmlFor={fieldId("lote-inventario")} className={LABEL_CLS}>
                        Lote de inventario *
                    </label>
                    <select
                        id={fieldId("lote-inventario")}
                        value={form.idLote}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, idLote: e.target.value }))
                        }
                        required
                        className={INPUT_CLS}
                    >
                        <option value="">Selecciona un lote</option>
                        {lotes.map((lote) => (
                            <option
                                key={lote.idLoteInventario}
                                value={lote.idLoteInventario}
                            >
                                {etiquetaLote(lote)}
                            </option>
                        ))}
                    </select>
                    {lotes.length === 0 && (
                        <p className="mt-1 text-[11px] text-amber-700">
                            No hay lotes disponibles para este tipo de insumo.
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor={fieldId("fecha-refuerzo")} className={LABEL_CLS}>
                        Fecha de refuerzo
                    </label>
                    <input
                        id={fieldId("fecha-refuerzo")}
                        type="date"
                        value={form.fechaRefuerzo}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, fechaRefuerzo: e.target.value }))
                        }
                        className={INPUT_CLS}
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                    type="checkbox"
                    checked={form.esquemaCompleto}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, esquemaCompleto: e.target.checked }))
                    }
                    className="size-4 rounded border-input accent-primary"
                />
                Esquema completo (requiere fecha de refuerzo)
            </label>

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
                        <Syringe size={14} aria-hidden="true" />
                    )}
                    Registrar evento
                </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
                Se descontará exactamente 1 unidad del lote seleccionado.
            </p>
        </form>
    );
}
