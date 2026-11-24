import {
    Boxes,
    Building2,
    CalendarDays,
    Heart,
    Home,
    Megaphone,
    PawPrint,
    Settings,
    Users,
} from "lucide-react";

import type { NavSection } from "./navigation.types";

/**
 * Configuración canónica de la navegación autenticada.
 *
 * Reglas:
 * - Solo se declaran rutas que existen. Una ruta sin página es UI muerta.
 *   Las anclas de Inventario, Donaciones y Reportes se añadirán cuando sus
 *   páginas existan (fases F4.6 y F4.7).
 * - Un ancla = una entrada. Las subvistas se resuelven como pestañas dentro de
 *   la página, no como nuevos ítems del sidebar.
 * - El permiso es un string del catálogo RBAC; si no está sembrado, el ítem no
 *   se muestra (fail-closed).
 * - `hiddenForSuperadmin` oculta el ancla al superadmin (Operación y Extensión).
 *
 * Las rutas son canónicas en español (fase F2). Las rutas inglesas legadas se
 * mantienen como redirects 308 temporales en `next.config.js`.
 */
export const navigationSections: readonly NavSection[] = [
    {
        id: "operacion",
        label: "Operación",
        items: [
            {
                id: "panel",
                label: "Panel",
                href: "/dashboard",
                icon: Home,
                // El panel es la pantalla de aterrizaje: basta con tener sesión.
                // No depende de `reports.view`, que aún no está sembrado.
                hiddenForSuperadmin: true,
            },
            {
                id: "animals",
                label: "Animales",
                href: "/animales",
                icon: PawPrint,
                permission: "animals.view",
                hiddenForSuperadmin: true,
            },
            {
                id: "adoptions",
                label: "Adopciones",
                href: "/adopciones",
                icon: Heart,
                permission: "adoptions.view",
                hiddenForSuperadmin: true,
            },
            {
                id: "spaces",
                label: "Espacios",
                href: "/espacios",
                icon: Boxes,
                permission: "spaces.view",
                hiddenForSuperadmin: true,
            },
        ],
    },
    {
        id: "administracion",
        label: "Administración",
        items: [
            {
                id: "staff",
                label: "Personal",
                href: "/staff",
                icon: Users,
                permission: "users.view",
            },
            {
                id: "shelters",
                label: "Refugios",
                href: "/refugios",
                icon: Building2,
                superadminOnly: true,
            },
            {
                id: "settings",
                label: "Configuración",
                href: "/configuracion/refugio",
                icon: Settings,
            },
        ],
    },
    {
        id: "extension",
        label: "Extensión",
        items: [
            {
                id: "campaigns",
                label: "Campañas",
                href: "/campaigns",
                icon: Megaphone,
                permission: "campaigns.view",
                hiddenForSuperadmin: true,
            },
            {
                id: "events",
                label: "Eventos",
                href: "/events",
                icon: CalendarDays,
                permission: "events.view",
                hiddenForSuperadmin: true,
            },
        ],
    },
];

export const navigationItems = navigationSections.flatMap((section) => section.items);

/** Anclas que ocupan la barra inferior móvil, en orden. */
export const mobilePrimaryNavIds: readonly string[] = [
    "panel",
    "animals",
    "adoptions",
    "spaces",
];
