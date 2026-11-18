"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isPathActive, type NavSection } from "@/modules/navigation";
import { cn } from "@/components/ui/utils";

interface NavListProps {
    sections: readonly NavSection[];
    /**
     * `sidebar` se pinta sobre fondo oscuro; `sheet` sobre el fondo claro del
     * panel deslizante.
     */
    variant?: "sidebar" | "sheet";
    onNavigate?: () => void;
}

/**
 * Lista de anclas compartida por el sidebar de escritorio y el panel móvil.
 * Solo presenta: la decisión de qué se ve ya se tomó en el servidor.
 */
export function NavList({
    sections,
    variant = "sidebar",
    onNavigate,
}: NavListProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-6">
            {sections.map((section) => (
                <div key={section.id}>
                    <p
                        className={cn(
                            "mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest",
                            variant === "sidebar"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {section.label}
                    </p>
                    <ul className="space-y-0.5">
                        {section.items.map((item) => {
                            const active = isPathActive(pathname, item.href);
                            const Icon = item.icon;

                            return (
                                <li key={item.id}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                            variant === "sidebar"
                                                ? "focus-visible:ring-offset-foreground"
                                                : "focus-visible:ring-offset-background",
                                            active
                                                ? variant === "sidebar"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-primary/10 text-primary"
                                                : variant === "sidebar"
                                                    ? "text-gray-300 hover:bg-white/10 hover:text-white"
                                                    : "text-foreground hover:bg-secondary"
                                        )}
                                    >
                                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}
