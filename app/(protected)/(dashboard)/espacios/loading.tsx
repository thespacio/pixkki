function SpaceCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-pulse">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 rounded bg-muted" />
                    <div className="h-4 w-20 rounded bg-muted" />
                </div>
                <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-4 w-12 rounded bg-muted" />
                </div>
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="mt-4 pt-2 border-t border-border flex gap-2">
                <div className="h-8 w-24 rounded bg-muted" />
                <div className="h-8 w-20 rounded bg-muted" />
            </div>
        </div>
    );
}

export default function EspaciosLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-56 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-10 w-36 rounded bg-muted animate-pulse" />
            </div>
            <div className="mb-6 flex gap-3">
                <div className="h-10 w-64 rounded bg-muted animate-pulse" />
                <div className="h-10 w-40 rounded bg-muted animate-pulse" />
                <div className="h-10 w-32 rounded bg-muted animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SpaceCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}