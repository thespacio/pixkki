"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import {Switch} from "@/components/ui/switch";
import {toggleShelterStatusAction} from "@/modules/shelters/actions";

type Props = {
    id: number;
    activo: boolean;
};

/**
 * Switch de activación/desactivación de refugio (F-SHELTER-03).
 * Solo el superadmin puede operarlo (la autorización se valida en el server).
 */
export function ShelterStatusSwitch({id, activo}: Props) {
    const router = useRouter();
    const [checked, setChecked] = useState(activo);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState("");

    async function handleCheckedChange(nextChecked: boolean) {
        setChecked(nextChecked);
        setDisabled(true);
        setError("");

        try {
            const result = await toggleShelterStatusAction(id, nextChecked);

            if (!result.success) {
                setChecked(!nextChecked);
                setError(result.message);
                return;
            }

            router.refresh();
        } catch (err) {
            setChecked(!nextChecked);
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al actualizar el estado del refugio"
            );
        } finally {
            setDisabled(false);
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <Switch
                    checked={checked}
                    onCheckedChange={handleCheckedChange}
                    disabled={disabled}
                    aria-label={checked ? "Desactivar refugio" : "Activar refugio"}
                />
                <span className="text-xs text-muted-foreground">
                    {checked ? "Activo" : "Inactivo"}
                </span>
            </div>
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}
