"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="px-4 py-10 sm:px-6 lg:px-8">
            <ErrorState
                title="No pudimos cargar los perfiles"
                description="Revisa tu conexión e inténtalo de nuevo. Si el problema continúa, contacta al administrador."
                reset={reset}
            />
        </div>
    );
}
