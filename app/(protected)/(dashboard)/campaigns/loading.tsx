import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="mx-auto max-w-7xl"
        >
            <span className="sr-only">Cargando campañas...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-52 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
