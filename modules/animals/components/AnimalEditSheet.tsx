"use client";

// ---------------------------------------------------------------------------
// Edición de los datos del expediente desde la ficha rápida.
//
// Reutiliza `AnimalForm` en modo edición y el mismo schema de formulario del
// alta. La traducción a DTO parcial vive en los validators
// (`toUpdateAnimalInput`), así que aquí solo se orquesta la Action y el estado
// de guardado. La cuarentena, la disponibilidad de adopción, el estado clínico
// y el albergue quedan fuera de este formulario.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { Animal } from "@/modules/animals/types/animales.types";
import type { SpaceWithOptionalOccupancy } from "@/modules/spaces/ports/space-occupancy.port";
import { updateAnimalAction } from "../actions/animal.actions";
import {
    toAnimalFormDefaults,
    toUpdateAnimalInput,
    type CreateAnimalFormValues,
} from "../validators/animal.validators";
import { AnimalForm } from "./AnimalForm";

type Props = {
    animal: Animal;
    enCuarentena: boolean;
    espacios: SpaceWithOptionalOccupancy[];
    open: boolean;
    onClose: () => void;
    /** Animal devuelto por el servidor, para actualizar la ficha sin recargar. */
    onSaved: (animal: Animal) => void;
};

export function AnimalEditSheet({
    animal,
    enCuarentena,
    espacios,
    open,
    onClose,
    onSaved,
}: Props) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(values: CreateAnimalFormValues) {
        setError(null);
        setSaving(true);
        try {
            const result = await updateAnimalAction(
                toUpdateAnimalInput(values, animal.idAnimal),
            );
            if (!result.success) {
                setError(result.error);
                return;
            }
            onSaved(result.data);
            onClose();
        } catch {
            setError("No se pudieron guardar los cambios. Intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                if (!next && !saving) onClose();
            }}
        >
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-2xl"
            >
                <SheetHeader>
                    <SheetTitle>Editar datos del animal</SheetTitle>
                    <SheetDescription>
                        {animal.nombre ?? `${animal.especie} sin nombre`}
                        {animal.estadoNombre
                            ? ` · Estado actual: ${animal.estadoNombre}`
                            : ""}
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-6">
                    {error && (
                        <div
                            role="alert"
                            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <AnimalForm
                        mode="edit"
                        enCuarentena={enCuarentena}
                        espacios={espacios}
                        defaultValues={toAnimalFormDefaults(animal)}
                        onSubmit={handleSubmit}
                        submitLabel="Guardar cambios"
                        saving={saving}
                        onCancel={onClose}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
