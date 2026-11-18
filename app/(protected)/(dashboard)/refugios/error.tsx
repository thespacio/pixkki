"use client";

import { ErrorState } from "@/components/ui/error-state";

type RefugiosErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function RefugiosError({ reset }: RefugiosErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar los refugios"
                description="El listado no está disponible ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
