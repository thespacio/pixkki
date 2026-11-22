export default function Loading() {
    return (
        <div className="mx-auto max-w-5xl" aria-label="Cargando personal">
            <div className="h-8 w-56 rounded-lg bg-muted animate-pulse mb-3" />
            <div className="h-4 w-72 rounded-lg bg-muted animate-pulse mb-8" />
            <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 rounded-2xl border border-border bg-muted/40 animate-pulse" />
                ))}
            </div>
        </div>
    );
}
