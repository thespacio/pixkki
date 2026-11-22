"use client";

import { useCallback, useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/components/ui/utils";
import { NavList } from "@/components/layouts/NavList";
import { getVisibleNavigation, type NavSection } from "@/modules/navigation";

interface AppSidebarProps {
    shelterName: string;
    visibleNavIds: readonly string[];
}

const STORAGE_KEY = "pixkki.sidebar.collapsed";

function subscribeCollapsed(onStoreChange: () => void) {
    if (typeof window === "undefined") return () => {};

    const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) onStoreChange();
    };
    const handleLocalChange = () => onStoreChange();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pixkki:sidebar-collapsed", handleLocalChange);
    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("pixkki:sidebar-collapsed", handleLocalChange);
    };
}

function getCollapsedSnapshot() {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function getCollapsedServerSnapshot() {
    return false;
}

export function AppSidebar({ shelterName, visibleNavIds }: AppSidebarProps) {
    const collapsed = useSyncExternalStore(
        subscribeCollapsed,
        getCollapsedSnapshot,
        getCollapsedServerSnapshot
    );

    const toggleCollapsed = useCallback(() => {
        const next = !getCollapsedSnapshot();
        try {
            window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        } catch {
            // Ignorar: preferencia no persistida.
        }
        window.dispatchEvent(new Event("pixkki:sidebar-collapsed"));
    }, []);

    const sections: NavSection[] = getVisibleNavigation(visibleNavIds);
    const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
    const toggleLabel = collapsed ? "Expandir barra lateral" : "Colapsar barra lateral";

    return (
        <aside
            data-collapsed={collapsed ? "true" : "false"}
            className={cn(
                "hidden shrink-0 flex-col border-r border-white/10 bg-foreground transition-[width] duration-200 ease-out lg:flex",
                collapsed ? "w-[72px]" : "w-[240px]"
            )}
        >
            <div
                className={cn(
                    "flex items-center border-b border-white/10 py-5",
                    collapsed ? "justify-center px-2" : "gap-3 px-5"
                )}
            >
                <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary p-1"
                    title={collapsed ? shelterName : undefined}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logo.png" alt="" className="size-full object-contain" />
                </div>
                {!collapsed ? (
                    <span className="truncate text-base font-semibold tracking-tight text-white">
                        {shelterName}
                    </span>
                ) : null}
            </div>

            <nav
                aria-label="Navegación principal"
                className={cn(
                    "flex-1 overflow-y-auto py-4",
                    collapsed ? "px-2" : "px-3"
                )}
            >
                <NavList sections={sections} variant="sidebar" collapsed={collapsed} />
            </nav>

            <div
                className={cn(
                    "border-t border-white/10 py-3",
                    collapsed ? "px-2" : "px-3"
                )}
            >
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    aria-label={toggleLabel}
                    title={toggleLabel}
                    className={cn(
                        "flex min-h-11 w-full items-center rounded-xl text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground",
                        collapsed ? "justify-center px-0" : "gap-3 px-3"
                    )}
                >
                    <ToggleIcon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed ? <span>Colapsar</span> : null}
                </button>
            </div>
        </aside>
    );
}
