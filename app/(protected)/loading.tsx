import { Skeleton } from "@/components/ui/skeleton";

/**
 * Carga genérica de cualquier ruta protegida sin `loading.tsx` propio.
 * Mantiene la forma del contenido (cabecera + bloques) para evitar saltos.
 */
export default function ProtectedLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="mx-auto max-w-7xl"
        >
            <span className="sr-only">Cargando...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
