"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { findActiveNavLabel } from "@/modules/navigation";

/**
 * Breadcrumb derivado del mapa de rutas, no de texto libre por página.
 * Hoy muestra ancla + sección; los detalles (nivel 3) añadirán su propio
 * tramo cuando la ficha sea enlazable (F4.1).
 */
export function AppBreadcrumbs() {
    const pathname = usePathname();
    const activeLabel = findActiveNavLabel(pathname);

    return (
        <nav aria-label="Ruta de navegación" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm">
                <li>
                    <Link
                        href="/dashboard"
                        className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        Panel
                    </Link>
                </li>
                {activeLabel && activeLabel !== "Panel" ? (
                    <>
                        <li aria-hidden="true" className="text-muted-foreground">
                            /
                        </li>
                        <li
                            aria-current="page"
                            className="truncate font-medium text-foreground"
                        >
                            {activeLabel}
                        </li>
                    </>
                ) : null}
            </ol>
        </nav>
    );
}
