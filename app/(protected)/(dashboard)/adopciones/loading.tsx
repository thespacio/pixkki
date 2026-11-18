import { Skeleton } from "@/components/ui/skeleton";

export default function AdopcionesLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="p-6 md:p-8 max-w-7xl mx-auto"
        >
            <span className="sr-only">Cargando adopciones...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-52" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 w-full rounded-xl" />
                ))}
            </div>

            <Skeleton className="mb-6 h-20 w-full rounded-xl" />

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
