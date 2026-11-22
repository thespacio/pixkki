"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <ErrorState
                title="No pudimos cargar adopciones"
                description={error.message || "Ocurrió un error inesperado. Intenta nuevamente."}
                reset={reset}
            />
        </div>
    );
}