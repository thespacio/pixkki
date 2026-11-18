"use client";

import { ErrorState } from "@/components/ui/error-state";

type EspaciosErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function EspaciosError({ reset }: EspaciosErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <ErrorState
                title="No pudimos cargar los espacios"
                description="La ocupación de los espacios no está disponible ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
