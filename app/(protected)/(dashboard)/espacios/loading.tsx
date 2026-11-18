import { Skeleton } from "@/components/ui/skeleton";

export default function EspaciosLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="container mx-auto max-w-4xl px-4 py-8"
        >
            <span className="sr-only">Cargando espacios...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-9 w-40" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-44 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
