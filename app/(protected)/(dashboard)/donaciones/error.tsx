"use client";

import { ErrorState } from "@/components/ui/error-state";

type DonacionesErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function DonacionesError({ reset }: DonacionesErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar las donaciones"
                description="El historial y los indicadores no están disponibles ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
