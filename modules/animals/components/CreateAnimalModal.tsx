"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalForm } from "./AnimalForm";
import { createAnimalAction } from "../actions/animal.actions";
import type { CreateAnimalInput } from "../validators/animal.validators";
import {Space} from "@/modules/spaces/types/types";
import {AnimalState} from "@/modules/animals/types/animal-state.types";
import type { ShelterOption } from "@/modules/animals/components/AnimalFilterBar";


type Props = {
    estados: AnimalState[];
    espacios: Space[];
    /** Solo superadmin: albergues entre los que elegir. Vacío = se usa el albergue del usuario. */
    refugios?: ShelterOption[];
};

export function CreateAnimalModal({ estados, espacios, refugios = [] }: Props) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    // Escape cierra el modal (salvo mientras se guarda).
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, saving]);

    function openModal() {
        setError(null);
        setOpen(true);
    }

    async function handleSubmit(data: CreateAnimalInput) {
        setSaving(true);
        setError(null);
        try {
            const result = await createAnimalAction(data);
            if (!result.success) {
                setError(result.error);
                return;
            }

            const nombre = result.data.nombre ?? `${result.data.especie} sin nombre`;
            setOpen(false);
            setCreated(`${nombre} se registró correctamente`);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setCreated(null), 5000);
        } catch {
            setError("No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="flex items-center gap-3">
                {created && (
                    <span
                        role="status"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                    >
                        <CheckCircle2 size={14} aria-hidden="true" />
                        {created}
                    </span>
                )}
                <Button
                    onClick={openModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                    <Plus size={15} aria-hidden="true" /> Registrar animal
                </Button>
            </div>

            {open && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                    onClick={() => !saving && setOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-animal-title"
                        className="bg-background rounded-2xl border border-border w-full max-w-3xl p-6 shadow-xl my-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 id="create-animal-title" className="text-lg font-semibold text-foreground">
                                Registrar animal
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                disabled={saving}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <AnimalForm
                            estados={estados}
                            espacios={espacios}
                            refugios={refugios}
                            onSubmit={handleSubmit}
                            submitLabel="Registrar animal"
                            saving={saving}
                            onCancel={() => setOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
