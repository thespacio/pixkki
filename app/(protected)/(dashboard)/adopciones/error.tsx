"use client";

import { ErrorState } from "@/components/ui/error-state";

type AdopcionesErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function AdopcionesError({ reset }: AdopcionesErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar las adopciones"
                description="Las solicitudes no están disponibles ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
