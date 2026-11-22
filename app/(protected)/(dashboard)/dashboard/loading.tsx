import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="mx-auto max-w-7xl"
        >
            <span className="sr-only">Cargando panel...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 w-full rounded-xl" />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        </div>
    );
}
