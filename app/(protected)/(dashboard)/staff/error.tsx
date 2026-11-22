"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
                <AlertTriangle size={28} className="mx-auto mb-3" />
                <h2 className="text-lg font-semibold">No pudimos cargar el personal</h2>
                <p className="text-sm mt-1">Revisa tu conexión e inténtalo de nuevo.</p>
                <button
                    type="button"
                    onClick={reset}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
                    style={{ minHeight: 44 }}
                >
                    <RefreshCw size={15} /> Reintentar
                </button>
            </div>
        </div>
    );
}
