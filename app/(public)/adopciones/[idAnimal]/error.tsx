"use client";

import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
            <ErrorState
                title="No pudimos cargar este perfil"
                description={error.message || "Es posible que el animal ya no esté disponible. Intenta de nuevo o vuelve al catálogo."}
                reset={reset}
            />
            <div className="text-center">
                <Link
                    href="/adopciones"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary"
                >
                    Volver al catálogo
                </Link>
            </div>
        </div>
    );
}
