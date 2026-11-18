"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/ui/utils";

const tabs = [
    { href: "/configuracion/refugio", label: "Refugio" },
    { href: "/configuracion/cuenta", label: "Cuenta" },
    { href: "/configuracion/seguridad", label: "Seguridad" },
    { href: "/configuracion/apariencia", label: "Apariencia" },
] as const;

/**
 * Pestañas del ancla Configuración. Las subvistas son pestañas, no nuevas
 * entradas del sidebar (regla de navegación de F1).
 */
export function ConfiguracionTabs() {
    const pathname = usePathname();

    return (
        <nav aria-label="Secciones de configuración">
            <ul className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                    const active =
                        pathname === tab.href ||
                        pathname.startsWith(`${tab.href}/`);

                    return (
                        <li key={tab.href}>
                            <Link
                                href={tab.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "inline-flex min-h-11 items-center rounded-t-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    active
                                        ? "border-b-2 border-primary text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {tab.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
