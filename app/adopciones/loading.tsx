import { Skeleton } from "@/components/ui/skeleton";
import { CatalogSkeleton } from "@/modules/adoptions/components/public-catalog-view";

export default function Loading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-2">
                <Skeleton className="h-9 w-64 sm:h-10" />
                <Skeleton className="h-4 w-full max-w-xl" />
            </div>
            <CatalogSkeleton />
        </div>
    );
}
