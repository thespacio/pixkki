import type { ReactNode } from "react";

import { ConfiguracionTabs } from "./ConfiguracionTabs";

/**
 * Ancla Configuración: cabecera de pestañas compartida por sus subvistas.
 *
 * No añade padding ni contenedor: cada vista decide su ancho. La vista de
 * apariencia conserva su editor de altura completa.
 */
export default function ConfiguracionLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-full flex-col">
            <div className="border-b border-border px-4 pt-4 sm:px-6 md:px-8">
                <ConfiguracionTabs />
            </div>
            <div className="min-h-0 flex-1">{children}</div>
        </div>
    );
}
