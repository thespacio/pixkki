import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}