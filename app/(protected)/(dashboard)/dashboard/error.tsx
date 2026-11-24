"use client";

import { ErrorState } from "@/components/ui/error-state";

type DashboardErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
    return (
        <div className="mx-auto max-w-5xl">
            <ErrorState
                title="No pudimos cargar el panel"
                description="El resumen operativo no está disponible ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
