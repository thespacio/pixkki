import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <div
                aria-hidden="true"
                className="mx-auto w-full min-w-0 max-w-7xl space-y-5 overflow-x-clip px-4 py-6 pb-24 sm:space-y-6 sm:px-6 sm:py-8 sm:pb-28 lg:px-8"
            >
                <Skeleton className="h-5 w-40" />
                <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-6">
                    <div className="min-w-0 space-y-3">
                        <Skeleton className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/10]" />
                        <div className="flex gap-2 overflow-hidden">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="aspect-square w-16 shrink-0 rounded-lg sm:w-20" />
                            ))}
                        </div>
                    </div>
                    <div className="min-w-0 space-y-4">
                        <Skeleton className="h-8 w-3/4 sm:w-2/3" />
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-6 w-20 rounded-full" />
                            ))}
                        </div>
                        <Skeleton className="h-56 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
            <div
                aria-hidden="true"
                className="sticky bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6 lg:px-8"
            >
                <div className="mx-auto w-full max-w-7xl">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </>
    );
}
