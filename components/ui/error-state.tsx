"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "./button";
import { cn } from "./utils";

/**
 * Estado de error de una ancla o de una sección.
 *
 * Recibe el `reset()` del error boundary de Next.js (mismo contrato que los
 * archivos `error.tsx` de cada ancla). El mensaje va en español y apto para el
 * usuario final; nunca muestra el stack trace ni detalles internos
 * (`AGENTS.md` §13).
 */
type ErrorStateProps = {
    title?: string;
    description?: string;
    reset: () => void;
    retryLabel?: string;
    className?: string;
};

function ErrorState({
    title = "No pudimos cargar esta sección",
    description = "Revisa tu conexión e inténtalo de nuevo.",
    reset,
    retryLabel = "Reintentar",
    className,
}: ErrorStateProps) {
    return (
        <div
            role="alert"
            data-slot="error-state"
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center",
                className,
            )}
        >
            <AlertTriangle
                aria-hidden="true"
                className="mb-3 size-10 text-destructive"
            />
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={reset}
                className="mt-5"
            >
                <RefreshCw aria-hidden="true" />
                {retryLabel}
            </Button>
        </div>
    );
}

export { ErrorState };
export type { ErrorStateProps };
