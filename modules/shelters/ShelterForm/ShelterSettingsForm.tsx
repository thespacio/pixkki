"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ShelterForm } from "@/modules/shelters/ShelterForm/ShelterForm";
import { updateShelterAction } from "@/modules/shelters/actions";
import { useUpdateShelterForm } from "@/modules/shelters/hooks/useUpdateShelterForm";
import type { Shelter, ShelterFormValues } from "@/modules/shelters/types";

type ShelterSettingsFormProps = {
    shelter: Shelter;
    id: number;
};

/**
 * Edición de los datos del refugio propio desde Configuración.
 *
 * Reutiliza el schema y el formulario de refugios; a diferencia de
 * `EditShelterForm` (pensado para el detalle del superadmin), al guardar se
 * queda en la misma vista y refresca los datos.
 */
export function ShelterSettingsForm({ shelter, id }: ShelterSettingsFormProps) {
    const router = useRouter();
    const { form, isLoading, setIsLoading } = useUpdateShelterForm(shelter);
    const [saved, setSaved] = useState(false);

    async function onSubmit(data: ShelterFormValues) {
        setIsLoading(true);
        setSaved(false);
        form.clearErrors("root");

        try {
            await updateShelterAction(id, data);
            setSaved(true);
            router.refresh();
        } catch (error) {
            form.setError("root", {
                message:
                    error instanceof Error && error.message
                        ? error.message
                        : "No se pudieron guardar los datos del refugio.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            {saved ? (
                <p
                    role="status"
                    className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
                >
                    Datos del refugio actualizados.
                </p>
            ) : null}

            <ShelterForm
                form={form}
                onSubmit={onSubmit}
                isLoading={isLoading}
                mode="edit"
            />
        </div>
    );
}
