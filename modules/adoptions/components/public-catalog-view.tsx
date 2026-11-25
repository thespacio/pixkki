import Link from "next/link";
import { SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { createPublicCatalogService } from "../factories/create-public-catalog-service";
import { isAdoptionDomainError } from "../errors";
import type { PublicCatalogResponseDTO } from "../dtos/public-catalog.dto";
import { PublicCatalogFilters } from "./public-catalog-filters";
import { PublicAnimalCard } from "./public-animal-card";
import { CatalogPagination } from "./catalog-pagination";

type Props = {
    searchParams: Record<string, string | string[] | undefined>;
    basePath?: string;
    fixedRefugioSlug?: string;
    showFilters?: boolean;
};

function first(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

export function CatalogSkeleton() {
    return (
        <div className="space-y-6" aria-hidden="true">
            <Skeleton className="h-56 w-full rounded-2xl sm:h-40" />
            <Skeleton className="h-5 w-48" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
                        <Skeleton className="aspect-[4/3] w-full" />
                        <div className="space-y-2 p-4">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
            <Skeleton className="mx-auto h-11 w-64 rounded-xl" />
        </div>
    );
}

export async function PublicCatalogView({
    searchParams,
    basePath = "/adopciones",
    fixedRefugioSlug,
    showFilters = true,
}: Props) {
    const query: Record<string, string | undefined> = {
        refugio: fixedRefugioSlug ?? first(searchParams.refugio),
        especie: first(searchParams.especie),
        sexo: first(searchParams.sexo),
        tamano: first(searchParams.tamano),
        edadMin: first(searchParams.edadMin),
        edadMax: first(searchParams.edadMax),
        temperamento: first(searchParams.temperamento),
        q: first(searchParams.q),
        orden: first(searchParams.orden),
        page: first(searchParams.page),
        pageSize: first(searchParams.pageSize),
    };

    let data: PublicCatalogResponseDTO | null = null;
    let errorMessage: string | null = null;
    let refugios: Array<{ slug: string; nombre: string }> = [];
    let refugiosDisponibles = true;

    try {
        const service = await createPublicCatalogService();
        data = fixedRefugioSlug
            ? await service.listByRefugio(fixedRefugioSlug, query)
            : await service.listCatalog(query);

        if (showFilters && !fixedRefugioSlug) {
            try {
                const resultado = await service.listRefugios();
                refugios = resultado.refugios
                    .map((refugio) => ({
                        slug: refugio.slug?.trim() ?? "",
                        nombre: refugio.nombre?.trim() ?? "",
                    }))
                    .filter((refugio) => refugio.slug !== "" && refugio.nombre !== "");
            } catch {
                refugiosDisponibles = false;
            }
        }
    } catch (error) {
        errorMessage = isAdoptionDomainError(error)
            ? error.message
            : "No pudimos cargar el catálogo de adopciones.";
    }

    if (errorMessage) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
                <h2 className="text-base font-semibold text-foreground">No pudimos cargar el catálogo</h2>
                <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
                <Link href={basePath} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary">
                    Reintentar
                </Link>
            </div>
        );
    }

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const page = data?.page ?? 1;
    const pageSize = data?.pageSize ?? 12;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const paginationParams: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(query)) {
        if (!value || key === "page") continue;
        if (key === "refugio" && fixedRefugioSlug) continue;
        paginationParams[key] = value;
    }

    return (
        <div className="space-y-6">
            {showFilters && (
                <PublicCatalogFilters
                    key={JSON.stringify(query)}
                    basePath={basePath}
                    refugios={refugios}
                    refugiosDisponibles={refugiosDisponibles}
                    showRefugioFilter={!fixedRefugioSlug}
                />
            )}

            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                    {total} {total === 1 ? "animal disponible" : "animales disponibles"}
                </p>
                {totalPages > 1 && <p>Página {page} de {totalPages}</p>}
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon={SearchX}
                    title="No hay animales que coincidan con los filtros"
                    description="Prueba ajustando los filtros o limpia la búsqueda para ver más opciones."
                    action={
                        <Link
                            href={basePath}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                        >
                            {showFilters ? "Limpiar filtros" : "Ver todos los animales"}
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <PublicAnimalCard key={item.id_animal} item={item} />
                    ))}
                </div>
            )}

            <CatalogPagination
                basePath={basePath}
                params={paginationParams}
                page={page}
                totalPages={totalPages}
            />
        </div>
    );
}
