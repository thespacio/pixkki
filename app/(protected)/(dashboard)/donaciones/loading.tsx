import { Skeleton } from "@/components/ui/skeleton";

export default function DonacionesLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="p-6 md:p-8 max-w-7xl mx-auto"
        >
            <span className="sr-only">Cargando donaciones...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 w-full rounded-xl" />
                ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
