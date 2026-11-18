"use client";

import { ErrorState } from "@/components/ui/error-state";

type ConfiguracionErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ConfiguracionError({ reset }: ConfiguracionErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
            <ErrorState
                title="No pudimos cargar la configuración"
                description="Los ajustes no están disponibles ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
