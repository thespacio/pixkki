"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toggleShelterStatusAction } from "@/modules/shelters/actions";

type ShelterStatusDialogProps = {
    id: number;
    name: string;
    activo: boolean;
};

/**
 * Confirmación de activar/desactivar un refugio (`/refugios?confirmar=[id]`).
 *
 * Desactivar corta el acceso de todo el refugio, así que el texto lo dice de
 * forma explícita. La autorización real se revalida en el servidor.
 */
export function ShelterStatusDialog({
    id,
    name,
    activo,
}: ShelterStatusDialogProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    function close() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("confirmar");
        const query = params.toString();
        router.replace(query ? `/refugios?${query}` : "/refugios");
    }

    async function confirm() {
        setPending(true);
        setError(undefined);

        const result = await toggleShelterStatusAction(id, !activo);
        setPending(false);

        if (!result.success) {
            setError(result.message);
            return;
        }

        close();
    }

    return (
        <ConfirmDialog
            open
            onOpenChange={(next) => {
                if (!next && !pending) close();
            }}
            title={
                activo
                    ? `Desactivar "${name}"`
                    : `Activar "${name}"`
            }
            description={
                activo
                    ? "Los usuarios de este refugio no podrán iniciar sesión hasta que lo actives de nuevo. Esta acción se puede revertir."
                    : "Los usuarios de este refugio podrán volver a iniciar sesión."
            }
            confirmLabel={activo ? "Desactivar refugio" : "Activar refugio"}
            variant={activo ? "destructive" : "default"}
            pending={pending}
            error={error}
            onConfirm={confirm}
        />
    );
}
