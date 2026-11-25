import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-72 max-w-full" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="space-y-3">
                {Array.from({ length: 4 }, (_, indice) => (
                    <Skeleton key={indice} className="h-28 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
