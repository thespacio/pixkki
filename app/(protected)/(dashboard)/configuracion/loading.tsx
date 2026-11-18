import { Skeleton } from "@/components/ui/skeleton";

export default function ConfiguracionLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="p-6 md:p-8 max-w-3xl mx-auto"
        >
            <span className="sr-only">Cargando configuración...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
