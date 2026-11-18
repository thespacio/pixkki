import type { ReactNode } from "react";

import { cn } from "./utils";

/**
 * Barra de herramientas de listados: búsqueda, filtros, acciones y contador.
 *
 * Es presentacional y sin estado: cada ancla decide qué controles montar. El
 * contador se anuncia con `aria-live` para que el filtrado por teclado se
 * perciba sin mover el foco.
 */
type DataToolbarProps = {
    search?: ReactNode;
    filters?: ReactNode;
    actions?: ReactNode;
    count?: {
        shown: number;
        total: number;
    };
    className?: string;
};

function formatCount({ shown, total }: { shown: number; total: number }) {
    if (shown === total) {
        return total === 1 ? "1 resultado" : `${total} resultados`;
    }

    return `${shown} de ${total} resultados`;
}

function DataToolbar({
    search,
    filters,
    actions,
    count,
    className,
}: DataToolbarProps) {
    return (
        <div
            data-slot="data-toolbar"
            className={cn(
                "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between",
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">
                {search ? (
                    <div className="min-w-0 flex-1">{search}</div>
                ) : null}
                {filters ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {filters}
                    </div>
                ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
                {count ? (
                    <p
                        aria-live="polite"
                        className="text-sm text-muted-foreground"
                    >
                        {formatCount(count)}
                    </p>
                ) : null}
                {actions ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export { DataToolbar };
export type { DataToolbarProps };
