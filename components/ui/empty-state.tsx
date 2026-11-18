import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "./utils";

/**
 * Estado vacío compartido por todas las anclas de navegación.
 *
 * Siempre exige una acción de rescate (`action`), tal como fija
 * `plan-implementacion-frontend.md` (F3). No contiene lógica de negocio ni
 * acceso a datos: recibe el CTA ya construido por la vista.
 *
 * Es un Server Component: el icono y la acción se resuelven en el árbol que lo
 * consume, nunca se envían componentes a través del límite servidor → cliente.
 */
type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    action: ReactNode;
    className?: string;
};

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            data-slot="empty-state"
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center",
                className,
            )}
        >
            <Icon
                aria-hidden="true"
                className="mb-3 size-10 text-muted-foreground/60"
            />
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            <div className="mt-5">{action}</div>
        </div>
    );
}

export { EmptyState };
export type { EmptyStateProps };
