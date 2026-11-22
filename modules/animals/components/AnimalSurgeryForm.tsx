"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Loader2, Plus, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvailableInventoryLotsAction } from "../actions/animal-clinical.actions";
import { createAnimalSurgeryAction } from "../actions/animal-poblacional.actions";
import type { AnimalSurgery } from "../repositories/animal-surgery.repository";
import type { InventoryLot } from "@/modules/inventory/types/inventory.types";
import {
    TIPOS_CIRUGIA,
    type TipoCirugia,
} from "../validators/animal-surgery.validators";

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

type InsumoRow = {
    idLoteInventario: string;
    cantidad: string;
};

type FormState = {
    tipoCirugia: TipoCirugia | "";
    fechaCirugia: string;
    exitosa: "true" | "false";
    notasPostoperatorias: string;
    insumos: InsumoRow[];
};

function nowLocalDatetime(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function emptyForm(): FormState {
    return {
        tipoCirugia: "",
        fechaCirugia: nowLocalDatetime(),
        exitosa: "true",
        notasPostoperatorias: "",
        insumos: [],
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
    onSaved: (cirugia: AnimalSurgery) => void;
};

export function AnimalSurgeryForm({ idAnimal, onSaved }: Props) {
    const uid = useId();
    const fieldId = (name: string) => `${uid}-${name}`;
    const [form, setForm] = useState<FormState>(emptyForm);
    const [lotes, setLotes] = useState<InventoryLot[]>([]);
    const [lotesError, setLotesError] = useState<string | null>(null);
    const [loadingLotes, setLoadingLotes] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const loadLotes = useCallback(async () => {
        setLoadingLotes(true);
        setLotesError(null);
        const result = await getAvailableInventoryLotsAction("insumo_quirurgico");
        if (result.success) {
            setLotes(result.data);
        } else {
            setLotesError(result.error);
        }
        setLoadingLotes(false);
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            setLoadingLotes(true);
            setLotesError(null);
            const result = await getAvailableInventoryLotsAction("insumo_quirurgico");
            if (cancelled) return;
            if (result.success) {
                setLotes(result.data);
            } else {
                setLotesError(result.error);
            }
            setLoadingLotes(false);
        }
        void run();
        return () => {
            cancelled = true;
        };
    }, []);

    function addInsumo() {
        setForm((prev) => ({
            ...prev,
            insumos: [...prev.insumos, { idLoteInventario: "", cantidad: "1" }],
        }));
    }

    function removeInsumo(index: number) {
        setForm((prev) => ({
            ...prev,
            insumos: prev.insumos.filter((_, i) => i !== index),
        }));
    }

    function updateInsumo(index: number, patch: Partial<InsumoRow>) {
        setForm((prev) => ({
            ...prev,
            insumos: prev.insumos.map((row, i) =>
                i === index ? { ...row, ...patch } : row,
            ),
        }));
    }

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        if (!form.tipoCirugia) {
            setError("Selecciona el tipo de cirugía.");
            return;
        }
        if (!form.fechaCirugia) {
            setError("La fecha de la cirugía es obligatoria.");
            return;
        }
        const fecha = new Date(form.fechaCirugia);
        if (Number.isNaN(fecha.getTime())) {
            setError("La fecha de la cirugía no es válida.");
            return;
        }
        if (fecha.getTime() > Date.now()) {
            setError("La fecha de la cirugía no puede ser futura.");
            return;
        }

        const insumos = [];
        const seen = new Set<number>();
        for (const [index, row] of form.insumos.entries()) {
            if (!row.idLoteInventario) {
                setError(`Selecciona un lote en el insumo ${index + 1}.`);
                return;
            }
            const idLote = Number(row.idLoteInventario);
            const cantidad = Number(row.cantidad);
            if (!Number.isInteger(idLote) || idLote <= 0) {
                setError(`El lote del insumo ${index + 1} no es válido.`);
                return;
            }
            if (!Number.isInteger(cantidad) || cantidad < 1) {
                setError(`La cantidad del insumo ${index + 1} debe ser un entero mayor o igual a 1.`);
                return;
            }
            if (seen.has(idLote)) {
                setError("Un mismo lote no puede repetirse en la misma cirugía.");
                return;
            }
            seen.add(idLote);
            insumos.push({ id_lote_inventario: idLote, cantidad });
        }

        setSaving(true);
        const result = await createAnimalSurgeryAction(idAnimal, {
            tipo_cirugia: form.tipoCirugia,
            fecha_cirugia: fecha.toISOString(),
            exitosa: form.exitosa === "true",
            notas_postoperatorias: form.notasPostoperatorias.trim() || null,
            insumos,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            if (result.code === "CONFLICTO_CONCURRENCIA" || result.code === "STOCK_INSUFICIENTE") {
                void loadLotes();
            }
            return;
        }

        setOk("Cirugía registrada correctamente.");
        setForm(emptyForm());
        onSaved(result.data);
        void loadLotes();
    }

    return (
        <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor={fieldId("tipo")} className={LABEL_CLS}>
                        Tipo de cirugía *
                    </label>
                    <select
                        id={fieldId("tipo")}
                        value={form.tipoCirugia}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                tipoCirugia: e.target.value as TipoCirugia | "",
                            }))
                        }
                        className={INPUT_CLS}
                        required
                    >
                        <option value="">Selecciona un tipo</option>
                        {TIPOS_CIRUGIA.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {tipo}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={fieldId("fecha")} className={LABEL_CLS}>
                        Fecha y hora *
                    </label>
                    <input
                        id={fieldId("fecha")}
                        type="datetime-local"
                        max={nowLocalDatetime()}
                        value={form.fechaCirugia}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, fechaCirugia: e.target.value }))
                        }
                        className={INPUT_CLS}
                        required
                    />
                </div>

                <div>
                    <label htmlFor={fieldId("resultado")} className={LABEL_CLS}>
                        Resultado *
                    </label>
                    <select
                        id={fieldId("resultado")}
                        value={form.exitosa}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                exitosa: e.target.value as "true" | "false",
                            }))
                        }
                        className={INPUT_CLS}
                    >
                        <option value="true">Exitosa</option>
                        <option value="false">No exitosa</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor={fieldId("notas")} className={LABEL_CLS}>
                    Notas postoperatorias (opcional)
                </label>
                <textarea
                    id={fieldId("notas")}
                    value={form.notasPostoperatorias}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, notasPostoperatorias: e.target.value }))
                    }
                    rows={3}
                    maxLength={2000}
                    className={`${INPUT_CLS} resize-none`}
                />
            </div>

            <fieldset className="rounded-xl border border-border p-4">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Insumos utilizados (opcional)
                </legend>

                {loadingLotes ? (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        Cargando lotes quirúrgicos…
                    </p>
                ) : lotesError ? (
                    <p role="status" className="text-xs text-red-600">{lotesError}</p>
                ) : lotes.length === 0 ? (
                    <p className="text-xs text-amber-700">
                        No hay lotes quirúrgicos disponibles. Puedes registrar la cirugía sin insumos.
                    </p>
                ) : null}

                <div className="mt-3 space-y-3">
                    {form.insumos.map((row, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_120px_auto]"
                        >
                            <div>
                                <label htmlFor={fieldId(`lote-${index}`)} className={LABEL_CLS}>
                                    Lote *
                                </label>
                                <select
                                    id={fieldId(`lote-${index}`)}
                                    value={row.idLoteInventario}
                                    onChange={(e) =>
                                        updateInsumo(index, { idLoteInventario: e.target.value })
                                    }
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
                            </div>
                            <div>
                                <label htmlFor={fieldId(`cantidad-${index}`)} className={LABEL_CLS}>
                                    Cantidad *
                                </label>
                                <input
                                    id={fieldId(`cantidad-${index}`)}
                                    type="number"
                                    min={1}
                                    step={1}
                                    inputMode="numeric"
                                    value={row.cantidad}
                                    onChange={(e) =>
                                        updateInsumo(index, { cantidad: e.target.value })
                                    }
                                    className={INPUT_CLS}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeInsumo(index)}
                                    aria-label={`Quitar insumo ${index + 1}`}
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                    Quitar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addInsumo}
                        disabled={loadingLotes || lotes.length === 0}
                    >
                        <Plus size={14} aria-hidden="true" />
                        Agregar insumo
                    </Button>
                </div>
            </fieldset>

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

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    {saving ? (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Scissors size={14} aria-hidden="true" />
                    )}
                    Registrar cirugía
                </Button>
            </div>
        </form>
    );
}
