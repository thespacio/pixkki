import { Skeleton } from "@/components/ui/skeleton";

export default function AnimalesLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="mx-auto max-w-7xl"
        >
            <span className="sr-only">Cargando animales...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            <Skeleton className="mb-6 h-20 w-full rounded-xl" />

            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
