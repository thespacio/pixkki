"use client";

import { ErrorState } from "@/components/ui/error-state";

type EventsErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function EventsError({ reset }: EventsErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar los eventos"
                description="El calendario no está disponible ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
