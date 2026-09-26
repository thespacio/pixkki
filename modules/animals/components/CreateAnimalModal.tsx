"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalForm } from "./AnimalForm";
import { createAnimalAction } from "../actions/animal.actions";
import type { CreateAnimalInput } from "../validators/animal.validators";
import {Space} from "@/modules/spaces/types/types";
import {AnimalState} from "@/modules/animals/types/animal-state.types";


type Props = {
    estados: AnimalState[];
    espacios: Space[];
};

export function CreateAnimalModal({ estados, espacios }: Props) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<
        { type: "ok" | "error"; msg: string } | null
    >(null);

    async function handleSubmit(data: CreateAnimalInput) {
        setSaving(true);
        setFeedback(null);
        try {
            await createAnimalAction(data);
            setFeedback({ type: "ok", msg: "Animal creado exitosamente" });
            setOpen(false);
        } catch (error) {
            setFeedback({
                type: "error",
                msg:
                    error instanceof Error
                        ? error.message
                        : "Error al crear el animal",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                style={{ backgroundColor: "#43AE6D" }}
            >
                <Plus size={15} /> Registrar animal
            </Button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-background rounded-2xl border border-border w-full max-w-2xl p-6 shadow-xl my-4">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-foreground">
                                Registrar animal
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

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

                        <AnimalForm
                            estados={estados}
                            espacios={espacios}
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