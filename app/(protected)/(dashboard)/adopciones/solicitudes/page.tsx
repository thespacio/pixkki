import Link from "next/link";
import { getCurrentUser } from "@/modules/auth";
import { ADOPTION_PERMISSIONS } from "@/modules/adoptions/access";
import { createApplicationService } from "@/modules/adoptions/factories/create-application-service";
import { SolicitudesFilters } from "@/modules/adoptions/components/solicitudes-filters";
import { AdoptionStatusBadge } from "@/modules/adoptions/components/adoption-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = { searchParams: Record<string, string | string[] | undefined> };
function first(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function SolicitudesPage({ searchParams }: Props) {
    const user = await getCurrentUser();
    if (!user.permissions.includes(ADOPTION_PERMISSIONS.view)) {
        return <div className="p-6"><p className="text-sm text-muted-foreground">No tienes permiso para ver solicitudes.</p></div>;
    }

    const service = await createApplicationService();
    const query = {
        estado: first(searchParams.estado),
        q: first(searchParams.q),
        page: first(searchParams.page) ? Number(first(searchParams.page)) : 1,
        pageSize: 20,
    };
    const data = await service.list(query, user) as { items?: Array<Record<string, unknown>> };
    const items = data.items ?? [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground"><Link href="/adopciones" className="hover:underline">Adopciones</Link> / Solicitudes</p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Solicitudes de adopción</h1>
                </div>
                <div className="flex gap-2">
                    <Link href="/adopciones/solicitudes" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Solicitudes</Link>
                    <Link href="/adopciones/perfiles" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary">Perfiles</Link>
                </div>
            </div>

            <SolicitudesFilters />

            {items.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No hay solicitudes en este estado"
                    description="Ajusta los filtros o revisa otro estado para ver solicitudes."
                    action={<Link href="/adopciones/solicitudes" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Limpiar filtros</Link>}
                />
            ) : (
                <div className="space-y-3">
                    {items.map((s) => {
                        const animal = s.animal as Record<string, unknown> | undefined;
                        const adoptante = s.adoptante as Record<string, unknown> | undefined;
                        return (
                        <Card key={String(s.id_solicitud)}>
                            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-foreground">
                                            Folio: <span className="font-mono">{String(s.codigo_seguimiento ?? `Solicitud #${String(s.id_solicitud)}`)}</span>
                                        </p>
                                        <AdoptionStatusBadge status={String(s.estado_solicitud ?? "")} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {String(animal?.nombre ?? "Animal")} · {String(adoptante?.nombre_completo ?? "Adoptante")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {s.fecha_solicitud ? new Date(String(s.fecha_solicitud)).toLocaleString("es-MX") : ""}
                                    </p>
                                </div>
                                <Link
                                    href={`/adopciones/solicitudes/${String(s.id_solicitud)}`}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary"
                                >
                                    Ver detalle
                                </Link>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}