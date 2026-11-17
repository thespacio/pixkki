"use client";

// ---------------------------------------------------------------------------
// Skeleton de la ficha clínica (estado de carga, RF2.x / RF3.x / RF4.x).
// Mantiene la misma forma del contenido final para evitar layout shift.
// ---------------------------------------------------------------------------

import { Skeleton } from "@/components/ui/skeleton";

export function AnimalClinicalRecordSkeleton(): React.ReactElement {
    return (
        <div className="space-y-6">
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <span className="text-xs text-muted-foreground">Cargando ficha clínica…</span>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <section
                        key={i}
                        className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                    >
                        <div className="mb-4 pb-3 border-b border-border">
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
