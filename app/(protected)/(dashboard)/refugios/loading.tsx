import { Skeleton } from "@/components/ui/skeleton";

export default function RefugiosLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="p-6 md:p-8 max-w-7xl mx-auto"
        >
            <span className="sr-only">Cargando refugios...</span>

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-40 rounded-md" />
            </div>

            <Skeleton className="mb-6 h-20 w-full rounded-xl" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-56 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
