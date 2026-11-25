"use client";

// ---------------------------------------------------------------------------
// Barra de acciones fija de la ficha rápida (P2 / cobertura móvil).
//
// Un único CTA principal siempre visible («Ver ficha clínica completa») y las
// acciones poco frecuentes o destructivas agrupadas en «Más acciones». Los
// permisos se ocultan en la UI; el service vuelve a validarlos (P10).
// ---------------------------------------------------------------------------

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FileHeart, MoreHorizontal, Trash2 } from "lucide-react";

type Props = {
    idAnimal: number;
    disponibleAdopcion: boolean;
    enCuarentena: boolean;
    canEdit: boolean;
    canDelete: boolean;
    pending: boolean;
    onDelete: () => void;
};

export function AnimalQuickActions({
    idAnimal,
    disponibleAdopcion,
    enCuarentena,
    canEdit,
    canDelete,
    pending,
    onDelete,
}: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!menuOpen) return;
        function onPointerDown(event: PointerEvent) {
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
        }
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setMenuOpen(false);
        }
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    return (
        <div className="sticky bottom-0 mt-8 -mx-6 border-t border-border bg-background/95 px-6 pb-5 pt-4 backdrop-blur">
            <div className="flex items-center gap-2">
                <Link
                    href={`/animales/${idAnimal}/ficha-clinica`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                    <FileHeart size={15} aria-hidden="true" />
                    Ver ficha clínica completa
                </Link>

                {canDelete && (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            disabled={pending}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            aria-controls={menuId}
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-60"
                        >
                            <MoreHorizontal size={16} aria-hidden="true" />
                            Más acciones
                        </button>

                        {menuOpen && (
                            <div
                                id={menuId}
                                role="menu"
                                className="absolute bottom-full right-0 z-10 mb-2 w-60 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg"
                            >
                                {canDelete && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onDelete();
                                        }}
                                        disabled={pending}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Dar de baja
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {enCuarentena && !disponibleAdopcion && canEdit && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    En cuarentena no puede ofrecerse en adopción. Registra el alta médica
                    para habilitarlo.
                </p>
            )}
        </div>
    );
}
