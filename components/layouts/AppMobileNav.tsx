"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import {
    getVisibleNavigation,
    isPathActive,
    mobilePrimaryNavIds,
    navigationItems,
} from "@/modules/navigation";
import { NavList } from "@/components/layouts/NavList";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/components/ui/utils";

interface AppMobileNavProps {
    shelterName: string;
    visibleNavIds: readonly string[];
}

const MAX_PRIMARY_ITEMS = 4;

export function AppMobileNav({
    shelterName,
    visibleNavIds,
}: AppMobileNavProps) {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);

    const allowed = new Set(visibleNavIds);

    const primaryItems = mobilePrimaryNavIds
        .filter((id) => allowed.has(id))
        .map((id) => navigationItems.find((item) => item.id === id))
        .filter((item) => item !== undefined)
        .slice(0, MAX_PRIMARY_ITEMS);

    const sections = getVisibleNavigation(visibleNavIds);

    return (
        <>
            <nav
                aria-label="Navegación principal móvil"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
            >
                <ul className="flex items-stretch">
                    {primaryItems.map((item) => {
                        const active = isPathActive(pathname, item.href);
                        const Icon = item.icon;

                        return (
                            <li key={item.id} className="flex-1">
                                <Link
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                                        active
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="size-5" aria-hidden="true" />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}

                    <li className="flex-1">
                        <button
                            type="button"
                            onClick={() => setMoreOpen(true)}
                            className="flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                        >
                            <MoreHorizontal className="size-5" aria-hidden="true" />
                            <span>Más</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[80dvh] rounded-t-2xl p-0"
                >
                    <SheetHeader className="border-b border-border">
                        <SheetTitle className="truncate">{shelterName}</SheetTitle>
                        <SheetDescription className="sr-only">
                            Todas las secciones disponibles
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                        <NavList
                            sections={sections}
                            variant="sheet"
                            onNavigate={() => setMoreOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
