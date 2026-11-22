import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus, SearchX } from "lucide-react";
import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import { resolveVisibleNavIds } from "@/modules/navigation";
import { AppShell } from "@/components/layouts/AppShell";
import { PublicShell } from "@/components/layouts/PublicShell";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { cn } from "@/components/ui/utils";
import { getShelterDetailsByIdAction, getSheltersAction } from "@/modules/shelters/actions";
import type { Shelter } from "@/modules/shelters/types";
import { CreateShelterDialog } from "@/modules/shelters/ShelterForm/CreateShelterDialog";
import { ShelterCard } from "@/modules/shelters/ShelterForm/ShelterCard";
import { ShelterFilters } from "@/modules/shelters/ShelterForm/ShelterFilters";
import { ShelterStatusDialog } from "@/modules/shelters/ShelterForm/ShelterStatusDialog";

export const metadata: Metadata = { title: "Refugios" };

type SearchParams = {
    ciudad?: string; estado?: string; activo?: string; search?: string;
    page?: string; nuevo?: string; confirmar?: string;
};
type Props = { searchParams: SearchParams };

const PAGE_SIZE = 9;
function parsePage(value: string | undefined) { const p = Number(value); return Number.isInteger(p) && p > 0 ? p : 1; }
function parseActivo(value: string | undefined) { if (value === "true") return true; if (value === "false") return false; return undefined; }

async function PublicRefugios() {
    const service = await createPublicCatalogService();
    const data = await service.listRefugios() as { refugios?: Array<{ slug?: string; id_refugio?: number; nombre?: string; ciudad?: string; estado?: string; descripcion_publica?: string; adoptables?: number }> };
    const refugios = data.refugios ?? [];
    return (
        <PublicShell>
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Refugios</h1>
                    <p className="text-muted-foreground">Conoce refugios activos con animales disponibles para adopción.</p>
                </div>
                {refugios.length === 0 ? (
                    <EmptyState icon={Building2} title="No hay refugios con animales disponibles por ahora" description="Vuelve más tarde o explora el catálogo general." action={<Link href="/adopciones" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Ver adopciones</Link>} />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {refugios.map((r) => (
                            <Card key={r.slug ?? r.id_refugio}>
                                <CardContent className="space-y-3 p-5">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">{r.nombre}</h2>
                                        <p className="text-sm text-muted-foreground">{[r.ciudad, r.estado].filter(Boolean).join(", ")}</p>
                                    </div>
                                    {r.descripcion_publica && <p className="text-sm text-muted-foreground line-clamp-3">{r.descripcion_publica}</p>}
                                    <p className="text-xs text-muted-foreground">{r.adoptables ?? 0} adoptable(s)</p>
                                    {r.slug && <Link href={`/refugios/${r.slug}`} className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary">Ver refugio</Link>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PublicShell>
    );
}

async function AdminRefugios({ searchParams }: Props) {
    const page = parsePage(searchParams.page);
    const filters = {
        ciudad: searchParams.ciudad, estado: searchParams.estado, activo: parseActivo(searchParams.activo),
        search: searchParams.search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE,
    };
    const result = await getSheltersAction(filters);
    const shelters = result.data ?? [];
    const total = result.pagination?.total ?? shelters.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const hasFilters = Boolean(filters.search || filters.ciudad || filters.estado || filters.activo !== undefined);

    let confirmShelter: Shelter | null = null;
    const confirmId = Number(searchParams.confirmar);
    if (Number.isInteger(confirmId) && confirmId > 0) {
        try { confirmShelter = (await getShelterDetailsByIdAction(confirmId)).data; } catch { confirmShelter = null; }
    }

    function buildPageHref(target: number): string {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.ciudad) params.set("ciudad", filters.ciudad);
        if (filters.estado) params.set("estado", filters.estado);
        if (filters.activo !== undefined) params.set("activo", String(filters.activo));
        if (target > 1) params.set("page", String(target));
        const query = params.toString();
        return query ? `/refugios?${query}` : "/refugios";
    }

    const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (c) => c === 1 || c === totalPages || Math.abs(c - page) <= 1,
    );

    return (
        <div className="mx-auto max-w-7xl p-6 md:p-8">
            <PageHeader
                title="Refugios"
                description="Refugios registrados en la plataforma. Solo el superadministrador puede darlos de alta o cambiar su estado operativo."
                actions={<Button asChild size="lg"><Link href="/refugios?nuevo=1"><Plus aria-hidden="true" />Nuevo refugio</Link></Button>}
            />
            <ShelterFilters initial={{ search: searchParams.search ?? "", ciudad: searchParams.ciudad ?? "", estado: searchParams.estado ?? "", activo: searchParams.activo ?? "" }} count={{ shown: shelters.length, total }} />
            {shelters.length === 0 ? (
                hasFilters ? (
                    <EmptyState icon={SearchX} title="Ningún refugio coincide con los filtros" description="Ajusta la búsqueda o limpia los filtros para ver el resto del listado." action={<Button asChild variant="outline"><Link href="/refugios">Limpiar filtros</Link></Button>} />
                ) : (
                    <EmptyState icon={Building2} title="Aún no hay refugios registrados" description="Da de alta el primer refugio y su administrador para empezar a operar." action={<Button asChild size="lg"><Link href="/refugios?nuevo=1">Dar de alta un refugio</Link></Button>} />
                )
            ) : (
                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shelters.map((shelter) => <li key={shelter.id}><ShelterCard shelter={shelter} /></li>)}
                </ul>
            )}
            {totalPages > 1 ? (
                <Pagination className="mt-8">
                    <PaginationContent>
                        {visiblePages.map((target) => (
                            <PaginationItem key={target}>
                                <Link href={buildPageHref(target)} aria-current={target === page ? "page" : undefined} aria-label={`Página ${target}`} className={cn(buttonVariants({ variant: target === page ? "outline" : "ghost", size: "icon" }))}>{target}</Link>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            ) : null}
            {searchParams.nuevo === "1" ? <CreateShelterDialog /> : null}
            {searchParams.nuevo !== "1" && confirmShelter ? <ShelterStatusDialog id={confirmShelter.id} name={confirmShelter.nombre_albergue} activo={confirmShelter.activo} /> : null}
        </div>
    );
}

export default async function RefugiosPage({ searchParams }: Props) {
    let user: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
    try { user = await getCurrentUser(); } catch { user = null; }

    if (user && isSuperadmin(user)) {
        let shelterName = "Pixkki";
        if (user.shelterId !== null) {
            const shelter = await getShelterDetailsByIdAction(user.shelterId);
            if (shelter.success) shelterName = shelter.data.nombre_albergue;
        }
        const visibleNavIds = resolveVisibleNavIds({
            permissions: user.permissions,
            isSuperadmin: isSuperadmin(user),
            hasShelter: user.shelterId !== null,
        });
        return (
            <AppShell
                shelterName={shelterName}
                user={{ fullName: user.fullName, email: user.email, role: user.role }}
                visibleNavIds={visibleNavIds}
            >
                <AdminRefugios searchParams={searchParams} />
            </AppShell>
        );
    }

    return <PublicRefugios />;
}