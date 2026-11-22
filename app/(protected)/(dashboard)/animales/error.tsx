"use client";

import { ErrorState } from "@/components/ui/error-state";

type AnimalesErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function AnimalesError({ reset }: AnimalesErrorProps) {
    return (
        <div className="mx-auto max-w-5xl">
            <ErrorState
                title="No pudimos cargar los animales"
                description="El listado no está disponible ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
