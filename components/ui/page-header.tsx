import type { ReactNode } from "react";

import { cn } from "./utils";

/**
 * Cabecera de página compartida: título, descripción, acciones y breadcrumb
 * opcional.
 *
 * Es un Server Component. Las acciones llegan ya construidas por la vista, de
 * modo que aquí no se decide nada sobre permisos ni datos.
 */
type PageHeaderProps = {
    title: string;
    description?: string;
    breadcrumb?: ReactNode;
    actions?: ReactNode;
    className?: string;
};

function PageHeader({
    title,
    description,
    breadcrumb,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <header
            data-slot="page-header"
            className={cn(
                "mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
                className,
            )}
        >
            <div className="min-w-0 space-y-1">
                {breadcrumb ? (
                    <div className="text-sm text-muted-foreground">
                        {breadcrumb}
                    </div>
                ) : null}
                <h1 className="truncate text-2xl font-semibold text-foreground">
                    {title}
                </h1>
                {description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </header>
    );
}

export { PageHeader };
export type { PageHeaderProps };
