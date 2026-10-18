"use client";

import { useState, useTransition } from "react";
import { Stethoscope, X } from "lucide-react";
import {
    deleteAnimalAction,
    updateAnimalAction,
} from "../actions/animal.actions";
import {Animal} from "@/modules/animals/types/animales.types";


type Props = {
    animal: Animal;
    onClose: () => void;
};

export function AnimalDetailPanel({ animal, onClose }: Props) {
    const [pending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<
        { type: "ok" | "error"; msg: string } | null
    >(null);

    function toggleDisponible() {
        setFeedback(null);
        startTransition(async () => {
            try {
                await updateAnimalAction({
                    id: animal.idAnimal,
                    disponibleAdopcion: !animal.disponibleAdopcion,
                });
                setFeedback({
                    type: "ok",
                    msg: animal.disponibleAdopcion
                        ? "Marcado como no disponible"
                        : "Marcado como disponible para adopción",
                });
            } catch (error) {
                setFeedback({
                    type: "error",
                    msg:
                        error instanceof Error
                            ? error.message
                            : "No se pudo actualizar el animal",
                });
            }
        });
    }

    function darDeBaja() {
        if (!confirm(`¿Dar de baja a ${animal.nombre ?? animal.especie}?`)) return;
        setFeedback(null);
        startTransition(async () => {
            try {
                await deleteAnimalAction(animal.idAnimal);
                onClose();
            } catch (error) {
                setFeedback({
                    type: "error",
                    msg:
                        error instanceof Error
                            ? error.message
                            : "No se pudo dar de baja el animal",
                });
            }
        });
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex justify-end"
            onClick={onClose}
        >
            <div
                className="bg-background w-full max-w-sm h-full overflow-y-auto shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground">Detalle del animal</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Título */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {animal.nombre ?? `${animal.especie} sin nombre`}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {animal.raza ?? animal.especie} ·{" "}
                        {animal.sexo === "M" ? "Macho" : "Hembra"}
                    </p>
                </div>

                {/* Feedback */}
                {feedback && (
                    <div
                        className={`mb-4 px-4 py-3 rounded-xl text-sm ${
                            feedback.type === "ok"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                    >
                        {feedback.msg}
                    </div>
                )}

                {/* Datos */}
                <div className="space-y-3 text-sm">
                    {[
                        { label: "Estado", val: `${animal.estadoNombre}` },
                        { label: "Espacio", val: `${animal.espacioNombre}` },
                        {
                            label: "Edad estimada",
                            val:
                                animal.edadEstimada !== null
                                    ? `${animal.edadEstimada} meses`
                                    : "—",
                        },
                        {
                            label: "Peso",
                            val: animal.peso !== null ? `${animal.peso} kg` : "—",
                        },
                        { label: "Procedencia", val: animal.procedencia },
                        { label: "Rasgos físicos", val: animal.rasgosFisicos },
                        { label: "Estado inicial", val: animal.estadoInicial },
                    ].map(({ label, val }) => (
                        <div key={label}>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                                {label}
                            </p>
                            <p className="text-foreground">{val ?? "—"}</p>
                        </div>
                    ))}

                    <div className="flex gap-2 flex-wrap pt-2">
                        {animal.enCuarentena && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-600">
                Cuarentena
              </span>
                        )}
                        {animal.esterilizado && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600">
                Esterilizado
              </span>
                        )}
                        {animal.disponibleAdopcion && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700">
                En adopción
              </span>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={toggleDisponible}
                        disabled={pending}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition disabled:opacity-60 ${
                            animal.disponibleAdopcion
                                ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                    >
                        {pending
                            ? "Procesando..."
                            : animal.disponibleAdopcion
                                ? "Marcar como no disponible"
                                : "Marcar disponible para adopción"}
                    </button>
                    <button
                        onClick={darDeBaja}
                        disabled={pending}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-60"
                    >
                        Dar de baja
                    </button>
                </div>

                {/* Placeholder veterinario */}
                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Stethoscope size={12} /> Expediente veterinario — próximamente
                    </p>
                </div>
            </div>
        </div>
    );
}