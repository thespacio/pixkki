"use client";

import { ErrorState } from "@/components/ui/error-state";

type EventsErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function EventsError({ reset }: EventsErrorProps) {
    return (
        <div className="mx-auto max-w-5xl">
            <ErrorState
                title="No pudimos cargar los eventos"
                description="El calendario no está disponible ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
