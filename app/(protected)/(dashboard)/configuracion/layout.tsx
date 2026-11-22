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
            <div className="border-b border-border">
                <ConfiguracionTabs />
            </div>
            <div className="min-h-0 flex-1 pt-6">{children}</div>
        </div>
    );
}
