import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="space-y-6"
        >
            <span className="sr-only">Cargando resumen del panel...</span>

            <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full rounded-xl" />
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-80 w-full rounded-xl" />
                <Skeleton className="h-80 w-full rounded-xl" />
            </div>
        </div>
    );
}
