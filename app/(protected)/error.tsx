"use client";

import { ErrorState } from "@/components/ui/error-state";

type ProtectedErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

/**
 * Frontera de error genérica de toda ruta protegida. Las anclas con mensaje
 * propio la sobrescriben con su `error.tsx`.
 */
export default function ProtectedError({ reset }: ProtectedErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar esta sección"
                description="Puede ser un problema temporal de conexión. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
