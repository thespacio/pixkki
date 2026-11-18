import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "./utils";

/**
 * Aviso de datos parciales.
 *
 * Solo debe renderizarse cuando el backend devuelve datos incompletos de forma
 * verificable (por ejemplo, un listado con `warnings`). No reemplaza al estado
 * vacío ni al de error.
 *
 * Es un Server Component: la acción de recarga la construye la vista.
 */
type PartialStateProps = {
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
};

function PartialState({
    title,
    description,
    action,
    className,
}: PartialStateProps) {
    return (
        <div
            role="status"
            data-slot="partial-state"
            className={cn(
                "flex flex-col gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-4 text-amber-900 sm:flex-row sm:items-start dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
                className,
            )}
        >
            <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200/80">
                    {description}
                </p>
            </div>
            {action ? <div className="sm:pt-0.5">{action}</div> : null}
        </div>
    );
}

export { PartialState };
export type { PartialStateProps };
