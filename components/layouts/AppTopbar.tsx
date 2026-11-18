"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Shield } from "lucide-react";

import { logout } from "@/modules/auth/client";
import { getVisibleNavigation } from "@/modules/navigation";
import { AppBreadcrumbs } from "@/components/layouts/AppBreadcrumbs";
import { NavList } from "@/components/layouts/NavList";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface AppTopbarProps {
    shelterName: string;
    user: {
        fullName: string;
        email: string;
        role: string;
    };
    visibleNavIds: readonly string[];
}

export function AppTopbar({
    shelterName,
    user,
    visibleNavIds,
}: AppTopbarProps) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sections = getVisibleNavigation(visibleNavIds);

    async function handleLogout() {
        setError(null);

        try {
            await logout();
            router.replace("/login");
            router.refresh();
        } catch {
            setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
        }
    }

    return (
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
            <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            >
                <Menu className="size-5" aria-hidden="true" />
                <span className="sr-only">Abrir menú de navegación</span>
            </button>

            <AppBreadcrumbs />

            <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {user.fullName
                            .split(" ")
                            .filter(Boolean)
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                    </span>
                    <span className="hidden min-w-0 text-left sm:block">
                        <span className="block max-w-40 truncate text-sm font-medium text-foreground">
                            {user.fullName}
                        </span>
                        <span className="block max-w-40 truncate text-xs capitalize text-muted-foreground">
                            {user.role}
                        </span>
                    </span>
                    <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                    />
                </summary>

                <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-border bg-card p-1 shadow-lg">
                    <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-card-foreground">
                            {user.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                    <Link
                        href="/configuracion/seguridad"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Shield className="size-4" aria-hidden="true" />
                        Seguridad de la cuenta
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <LogOut className="size-4" aria-hidden="true" />
                        Cerrar sesión
                    </button>
                    {error ? (
                        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
                            {error}
                        </p>
                    ) : null}
                </div>
            </details>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle className="truncate">{shelterName}</SheetTitle>
                        <SheetDescription className="sr-only">
                            Navegación principal del panel
                        </SheetDescription>
                    </SheetHeader>
                    <nav
                        aria-label="Navegación principal"
                        className="flex-1 overflow-y-auto p-3"
                    >
                        <NavList
                            sections={sections}
                            variant="sheet"
                            onNavigate={() => setMenuOpen(false)}
                        />
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}
