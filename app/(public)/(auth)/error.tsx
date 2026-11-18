"use client";

import { useRouter } from "next/navigation";

export default function AuthError({ reset }: { reset: () => void }) {
    const router = useRouter();

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Hubo un error
                </h2>
                <p className="text-muted-foreground mt-2">
                    No se pudo cargar esta página de autenticación.
                </p>
                <button
                    onClick={() => {
                        reset();
                        router.refresh();
                    }}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}