"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { logout } from "@/modules/auth/client";
import {
    getVisibleNavigation,
    type NavSection,
} from "@/modules/navigation";
import { NavList } from "@/components/layouts/NavList";

interface AppSidebarProps {
    shelterName: string;
    user: {
        fullName: string;
        role: string;
    };
    visibleNavIds: readonly string[];
}

function getInitials(fullName: string): string {
    return fullName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function AppSidebar({
    shelterName,
    user,
    visibleNavIds,
}: AppSidebarProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [signingOut, setSigningOut] = useState(false);

    const sections: NavSection[] = getVisibleNavigation(visibleNavIds);

    async function handleLogout() {
        setSigningOut(true);
        setError(null);

        try {
            await logout();
            router.replace("/login");
            router.refresh();
        } catch {
            setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
            setSigningOut(false);
        }
    }

    return (
        <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/10 bg-foreground lg:flex">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logo.png" alt="" className="size-full object-contain" />
                </div>
                <span className="truncate text-base font-semibold tracking-tight text-white">
                    {shelterName}
                </span>
            </div>

            <nav
                aria-label="Navegación principal"
                className="flex-1 overflow-y-auto px-3 py-4"
            >
                <NavList sections={sections} variant="sidebar" />
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
                {error ? (
                    <p role="alert" className="mb-2 text-xs text-red-300">
                        {error}
                    </p>
                ) : null}
                <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {getInitials(user.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                            {user.fullName}
                        </p>
                        <p className="truncate text-xs capitalize text-gray-400">
                            {user.role}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={signingOut}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground disabled:opacity-50"
                        title="Cerrar sesión"
                    >
                        <LogOut className="size-4" aria-hidden="true" />
                        <span className="sr-only">Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
