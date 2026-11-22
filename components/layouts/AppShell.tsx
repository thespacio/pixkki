import type { ReactNode } from "react";

import { AppMobileNav } from "@/components/layouts/AppMobileNav";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { AppTopbar } from "@/components/layouts/AppTopbar";

interface AppShellProps {
    children: ReactNode;
    shelterName: string;
    user: {
        fullName: string;
        email: string;
        role: string;
    };
    /** Ids ya autorizados por el servidor. Nunca se envían componentes. */
    visibleNavIds: readonly string[];
}

/**
 * Shell único del área autenticada.
 *
 * Es un Server Component: compone y entrega los ids de navegación autorizados.
 * Las islas cliente (sidebar, topbar, barra móvil) solo presentan.
 */
export function AppShell({
    children,
    shelterName,
    user,
    visibleNavIds,
}: AppShellProps) {
    return (
        <div className="flex h-dvh w-full overflow-hidden bg-background">
            <a
                href="#contenido-principal"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
            >
                Saltar al contenido
            </a>

            <AppSidebar shelterName={shelterName} visibleNavIds={visibleNavIds} />

            <div className="flex min-w-0 flex-1 flex-col">
                <AppTopbar
                    shelterName={shelterName}
                    user={user}
                    visibleNavIds={visibleNavIds}
                />
                <main
                    id="contenido-principal"
                    tabIndex={-1}
                    className="flex-1 overflow-y-auto px-4 py-6 pb-24 focus:outline-none sm:px-6 lg:px-8 lg:pb-8"
                >
                    {children}
                </main>
            </div>

            <AppMobileNav
                shelterName={shelterName}
                visibleNavIds={visibleNavIds}
            />
        </div>
    );
}
