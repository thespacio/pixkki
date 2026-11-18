import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="p-6 md:p-8 max-w-7xl mx-auto"
        >
            <span className="sr-only">Cargando eventos...</span>

            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        </div>
    );
}
