"use client";

// RF3.1 / RF3.2 — traslado de ubicación y control de ocupación (US12).
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MoveRight } from "lucide-react";
import {
    createAnimalTransferAction,
    getAnimalTransfersAction,
    getSpacesWithOccupancyAction,
} from "../actions/animal-socialization.actions";
import type { SpaceWithOccupancy } from "@/modules/spaces/ports/space-occupancy.port";
import type { AnimalTransfer } from "../repositories/animal-transfer.repository";
import { hoyLocalISO } from "../validators/animal.validators";

type Props = {
    idAnimal: number;
    canTransfer: boolean;
    /** Solo veterinario/admin pueden incluir el alta médica. */
    canRelease: boolean;
    enCuarentena?: boolean;
    onSaved?: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

type FormState = {
    destino: string;
    motivo: string;
    incluirAlta: boolean;
    observacionesAlta: string;
    fechaAlta: string;
};

function emptyForm(): FormState {
    return {
        destino: "",
        motivo: "",
        incluirAlta: false,
        observacionesAlta: "",
        fechaAlta: hoyLocalISO(),
    };
}

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

export function AnimalTransferPanel({ idAnimal, canTransfer, canRelease, enCuarentena = false, onSaved }: Props) {
    const [espacios, setEspacios] = useState<SpaceWithOccupancy[]>([]);
    const [traslados, setTraslados] = useState<AnimalTransfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const nombreEspacio = useCallback(
        (idEspacio: number) =>
            espacios.find((espacio) => espacio.id === idEspacio)?.name ?? `Espacio ${idEspacio}`,
        [espacios],
    );

    const loadTransfers = useCallback(async () => {
        const result = await getAnimalTransfersAction(idAnimal);
        if (result.success) setTraslados(result.data);
        else setError(result.error);
    }, [idAnimal]);

    const loadSpaces = useCallback(async () => {
        const result = await getSpacesWithOccupancyAction();
        if (result.success) {
            setEspacios(result.data);
        } else {
            setError(result.error);
        }
    }, []);

    useEffect(() => {
        let activo = true;
        async function initialLoad() {
            // Cargar espacios también en solo lectura para mostrar nombres en el historial.
            const [, spacesResult] = await Promise.all([
                loadTransfers(),
                getSpacesWithOccupancyAction(),
            ]);
            if (!activo) return;
            if (spacesResult.success) setEspacios(spacesResult.data);
            setLoading(false);
        }
        void initialLoad();
        return () => {
            activo = false;
        };
    }, [loadTransfers]);

    const espaciosDestino = espacios.filter((espacio) => {
        if (enCuarentena && espacio.type !== 'cuarentena') return false;
        return true;
    });

    async function guardar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setOk(null);

        if (!form.destino) {
            setError("Selecciona un espacio destino.");
            return;
        }
        if (form.incluirAlta && form.observacionesAlta.trim() === "") {
            setError("Las observaciones clínicas del alta son obligatorias.");
            return;
        }

        setSaving(true);
        const result = await createAnimalTransferAction(idAnimal, {
            id_espacio_destino: Number(form.destino),
            motivo: form.motivo.trim() || null,
            alta_medica: form.incluirAlta
                ? {
                      observaciones: form.observacionesAlta.trim(),
                      fecha_alta: form.fechaAlta || null,
                  }
                : null,
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setTraslados((prev) => [result.data, ...prev]);
        setOk(
            result.data.alta
                ? "Alta médica registrada y traslado completado."
                : "Traslado registrado correctamente.",
        );
        setForm(emptyForm());
        await loadSpaces();
        onSaved?.();
    }

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Ubicación y traslados
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando traslados…
                </p>
            ) : traslados.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aún no hay traslados registrados.</p>
            ) : (
                <ul className="space-y-2">
                    {traslados.map((traslado) => (
                        <li key={traslado.idTraslado} className="rounded-xl border border-border bg-card p-3">
                            <p className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <span>{nombreEspacio(traslado.idEspacioOrigen)}</span>
                                <MoveRight size={14} aria-hidden="true" />
                                <span>{nombreEspacio(traslado.idEspacioDestino)}</span>
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {formatFecha(traslado.fechaTraslado)}
                                {traslado.motivo ? ` · ${traslado.motivo}` : ""}
                            </p>
                            {traslado.alta && (
                                <p className="mt-1 text-[11px] text-green-700">
                                    Incluye alta médica: {traslado.alta.observaciones}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canTransfer ? (
                <form onSubmit={guardar} className="mt-4 space-y-3">
                    <div>
                        <label htmlFor={`destino-${idAnimal}`} className={LABEL_CLS}>
                            Espacio destino *
                        </label>
                        {enCuarentena && (
                            <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                El paciente está en cuarentena: solo puede trasladarse a un espacio de cuarentena.
                            </p>
                        )}
                        {enCuarentena && !espaciosDestino.some((e) => e.capacidadLibre > 0 && e.available) && (
                            <p className="mb-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                No hay espacios de cuarentena con cupo disponibles.{" "}
                                <Link href="/espacios" className="font-medium text-primary underline-offset-2 hover:underline">
                                    Crea o marca un espacio como tipo Cuarentena
                                </Link>{" "}
                                en Espacios.
                            </p>
                        )}
                        <select
                            id={`destino-${idAnimal}`}
                            value={form.destino}
                            onChange={(e) => setForm((p) => ({ ...p, destino: e.target.value }))}
                            required
                            className={INPUT_CLS}
                        >
                            <option value="">Selecciona un espacio</option>
                            {espaciosDestino.map((espacio) => {
                                const sinCupo = espacio.capacidadLibre <= 0 || !espacio.available;
                                return (
                                    <option key={espacio.id} value={espacio.id} disabled={sinCupo}>
                                        {espacio.name} · {espacio.type} · {espacio.estadoTexto}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`motivo-${idAnimal}`} className={LABEL_CLS}>
                            Motivo (opcional)
                        </label>
                        <input
                            id={`motivo-${idAnimal}`}
                            value={form.motivo}
                            onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
                            maxLength={255}
                            className={INPUT_CLS}
                        />
                    </div>

                    {canRelease && (
                        <div className="rounded-xl border border-border p-3">
                            <label className="flex items-center gap-2 text-xs text-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.incluirAlta}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, incluirAlta: e.target.checked }))
                                    }
                                    className="size-4 rounded border-input accent-primary"
                                />
                                Incluir alta médica (libera la cuarentena)
                            </label>
                            {form.incluirAlta && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label htmlFor={`obs-alta-${idAnimal}`} className={LABEL_CLS}>
                                            Observaciones clínicas *
                                        </label>
                                        <textarea
                                            id={`obs-alta-${idAnimal}`}
                                            value={form.observacionesAlta}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    observacionesAlta: e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            maxLength={2000}
                                            required
                                            className={`${INPUT_CLS} resize-none`}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`fecha-alta-${idAnimal}`} className={LABEL_CLS}>
                                            Fecha del alta (opcional)
                                        </label>
                                        <input
                                            id={`fecha-alta-${idAnimal}`}
                                            type="date"
                                            max={hoyLocalISO()}
                                            value={form.fechaAlta}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, fechaAlta: e.target.value }))
                                            }
                                            className={INPUT_CLS}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                            <MoveRight size={14} aria-hidden="true" />
                        )}
                        Registrar traslado
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Un paciente en cuarentena solo puede moverse a un espacio de cuarentena salvo alta médica.
                    </p>
                </form>
            ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">
                    No tienes permisos para registrar traslados.
                </p>
            )}
        </section>
    );
}
