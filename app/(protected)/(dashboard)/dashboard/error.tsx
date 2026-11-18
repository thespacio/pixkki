"use client";

import { ErrorState } from "@/components/ui/error-state";

type DashboardErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar el panel"
                description="Los indicadores no están disponibles ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
