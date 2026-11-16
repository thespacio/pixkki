"use client";

// ---------------------------------------------------------------------------
// Vacunación y desparasitación de entrada (RF2.2 / RF2.3, US10).
//
// El usuario elige un lote con stock real del refugio. La Server Action valida
// con Zod y la RPC descuenta exactamente 1 unidad en la misma transacción en
// que se persiste el evento sanitario.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Syringe } from "lucide-react";
import {
    createAnimalSanitaryEventAction,
    getAnimalSanitaryEventsAction,
    getAvailableInventoryLotsAction,
} from "../actions/animal-clinical.actions";
import { hoyLocalISO } from "../validators/animal.validators";
import {
    TIPOS_EVENTO_SANITARIO,
    type TipoEventoSanitario,
} from "../validators/animal-sanitary-event.validators";
import type { AnimalSanitaryEvent } from "../repositories/animal-sanitary-event.repository";
import type { InventoryLot } from "@/modules/inventory/types/inventory.types";

type Props = {
    idAnimal: number;
    canRegister: boolean;
    onSaved?: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

const EVENTO_LABEL: Record<TipoEventoSanitario, string> = {
    vacunacion: "Vacunación",
    desparasitacion: "Desparasitación",
};

const TIPO_INSUMO: Record<TipoEventoSanitario, "vacuna" | "desparasitante"> = {
    vacunacion: "vacuna",
    desparasitacion: "desparasitante",
};

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

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function etiquetaLote(lote: InventoryLot): string {
    const detalle = [lote.nombreInsumo, lote.marca, lote.lote]
        .filter(Boolean)
        .join(" · ");
    return `${detalle} (${lote.stockActual} ${lote.unidadMedida} disponibles)`;
}

export function AnimalSanitaryEventPanel({ idAnimal, canRegister, onSaved }: Props) {
    const [eventos, setEventos] = useState<AnimalSanitaryEvent[]>([]);
    const [lotes, setLotes] = useState<InventoryLot[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const loadEvents = useCallback(async () => {
        const result = await getAnimalSanitaryEventsAction(idAnimal);
        if (result.success) {
            setEventos(result.data);
        } else {
            setError(result.error);
        }
    }, [idAnimal]);

    useEffect(() => {
        let activo = true;
        async function initialLoad() {
            await loadEvents();
            if (activo) setLoading(false);
        }
        void initialLoad();
        return () => {
            activo = false;
        };
    }, [loadEvents]);

    const loadLots = useCallback(async (tipo: TipoEventoSanitario) => {
        const result = await getAvailableInventoryLotsAction(TIPO_INSUMO[tipo]);
        if (result.success) {
            setLotes(result.data);
            setForm((prev) => ({
                ...prev,
                idLote: result.data.some((l) => String(l.idLoteInventario) === prev.idLote)
                    ? prev.idLote
                    : "",
            }));
        } else {
            setError(result.error);
        }
    }, []);

    useEffect(() => {
        if (canRegister) void loadLots(form.tipoEvento);
    }, [canRegister, form.tipoEvento, loadLots]);

    function changeTipo(tipo: TipoEventoSanitario) {
        setForm((prev) => ({
            ...prev,
            tipoEvento: tipo,
            idLote: "",
            tipoBiologico: "",
            marcaLote: "",
        }));
        setError(null);
        setOk(null);
    }

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

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

        setEventos((prev) => [result.data, ...prev]);
        setForm({ ...emptyForm(), tipoEvento: form.tipoEvento });
        setOk(
            `${EVENTO_LABEL[form.tipoEvento]} registrada. Se descontó 1 unidad; quedan ${result.data.stockRestante ?? "—"}.`,
        );
        await loadLots(form.tipoEvento);
        onSaved?.();
    }

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Vacunación y desparasitación
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando eventos sanitarios…
                </p>
            ) : eventos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Aún no hay eventos sanitarios registrados.
                </p>
            ) : (
                <ul className="space-y-3">
                    {eventos.map((evento) => (
                        <li
                            key={evento.idEvento}
                            className="rounded-xl border border-border bg-card p-3"
                        >
                            <p className="text-xs font-semibold text-foreground">
                                {EVENTO_LABEL[evento.tipoEvento]} · {evento.tipoBiologico}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Aplicado el {formatFecha(evento.fechaAplicacion)}
                                {evento.marcaLote ? ` · Lote ${evento.marcaLote}` : ""}
                                {evento.fechaRefuerzo
                                    ? ` · Refuerzo ${formatFecha(evento.fechaRefuerzo)}`
                                    : ""}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {evento.esquemaCompleto ? "Esquema completo" : "Esquema incompleto"}
                                {evento.cantidadDescontada
                                    ? ` · 1 unidad descontada del inventario`
                                    : ""}
                            </p>
                            {evento.observaciones && (
                                <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                                    {evento.observaciones}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canRegister ? (
                <form onSubmit={guardar} className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label htmlFor={`tipo-evento-${idAnimal}`} className={LABEL_CLS}>
                                Tipo de evento *
                            </label>
                            <select
                                id={`tipo-evento-${idAnimal}`}
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
                            <label htmlFor={`biologico-${idAnimal}`} className={LABEL_CLS}>
                                Biológico o producto *
                            </label>
                            <input
                                id={`biologico-${idAnimal}`}
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
                            <label htmlFor={`fecha-aplicacion-${idAnimal}`} className={LABEL_CLS}>
                                Fecha de aplicación *
                            </label>
                            <input
                                id={`fecha-aplicacion-${idAnimal}`}
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
                            <label htmlFor={`marca-lote-${idAnimal}`} className={LABEL_CLS}>
                                Marca / lote comercial (opcional)
                            </label>
                            <input
                                id={`marca-lote-${idAnimal}`}
                                value={form.marcaLote}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, marcaLote: e.target.value }))
                                }
                                maxLength={120}
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label htmlFor={`lote-inventario-${idAnimal}`} className={LABEL_CLS}>
                                Lote de inventario *
                            </label>
                            <select
                                id={`lote-inventario-${idAnimal}`}
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
                            <label htmlFor={`fecha-refuerzo-${idAnimal}`} className={LABEL_CLS}>
                                Fecha de refuerzo
                            </label>
                            <input
                                id={`fecha-refuerzo-${idAnimal}`}
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
                        <label htmlFor={`obs-evento-${idAnimal}`} className={LABEL_CLS}>
                            Observaciones (opcional)
                        </label>
                        <textarea
                            id={`obs-evento-${idAnimal}`}
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
                            <Syringe size={14} aria-hidden="true" />
                        )}
                        Registrar evento sanitario
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Se descontará exactamente 1 unidad del lote seleccionado.
                    </p>
                </form>
            ) : (
                <>
                    {error && (
                        <p role="status" className="mt-3 text-xs text-red-600">
                            {error}
                        </p>
                    )}
                    <p className="mt-3 text-[11px] text-muted-foreground">
                        Solo un veterinario o un administrador puede registrar eventos sanitarios.
                    </p>
                </>
            )}
        </section>
    );
}
