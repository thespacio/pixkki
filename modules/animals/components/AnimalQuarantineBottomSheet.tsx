"use client";

// ---------------------------------------------------------------------------
// Alta médica de cuarentena (RF2.4 / US11).
// Bottom sheet en móvil, modal/drawer en escritorio. No altera la ruta base.
// El botón de confirmación es destructivo y va separado con estilo de peligro.
// ---------------------------------------------------------------------------

import { useCallback, useState, type FormEvent } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { releaseAnimalQuarantineAction } from "../actions/animal-clinical.actions";

type Props = {
    idAnimal: number;
    /** Se cierra tras un alta exitosa para refrescar la ficha. */
    onReleased: () => void;
    /** Indica si el sheet está abierto. */
    open: boolean;
    /** Callback para cerrar el sheet desde el padre. */
    onClose: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

export function AnimalQuarantineBottomSheet({
    idAnimal,
    onReleased,
    open,
    onClose,
}: Props) {
    const [observaciones, setObservaciones] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);

            if (observaciones.trim().length === 0) {
                setError(
                    "Las observaciones clínicas son obligatorias para registrar el alta.",
                );
                return;
            }

            setSaving(true);
            try {
                const result = await releaseAnimalQuarantineAction(idAnimal, {
                    observaciones: observaciones.trim(),
                });

                if (!result.success) {
                    setError(result.error ?? "No se pudo registrar el alta médica.");
                    setSaving(false);
                    return;
                }

                onReleased();
                onClose();
            } catch {
                setError("No se pudo registrar el alta médica. Intenta de nuevo.");
                setSaving(false);
            }
        },
        [idAnimal, observaciones, onReleased, onClose],
    );

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quarantine-sheet-title"
        >
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-md sm:max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <ShieldAlert size={24} className="text-red-600 shrink-0" aria-hidden="true" />
                        <div>
                            <h3 id="quarantine-sheet-title" className="text-sm font-semibold text-foreground">
                                Registrar alta médica
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                El alta es definitiva y queda registrada con tu usuario y la fecha.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <label htmlFor="quarantine-observaciones" className={LABEL_CLS}>
                        Observaciones clínicas *
                    </label>
                    <textarea
                        id="quarantine-observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={4}
                        maxLength={2000}
                        placeholder="Hallazgos, recomendaciones y motivo del alta…"
                        className={`${INPUT_CLS} resize-none`}
                        required
                    />
                    {error && (
                        <p role="alert" className="text-xs text-red-600">{error}</p>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-60"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-red-50 hover:bg-red-700 transition disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                            ) : (
                                <ShieldAlert size={14} aria-hidden="true" />
                            )}
                            Registrar alta definitiva
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
