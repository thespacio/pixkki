import Link from "next/link";
import { createPublicCatalogService } from "../factories/create-public-catalog-service";
import { PublicCatalogFilters } from "./public-catalog-filters";
import { PublicAnimalCard, type CatalogItem } from "./public-animal-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isAdoptionDomainError } from "../errors";

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="space-y-2 p-4">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export async function PublicCatalogView({
    searchParams,
    basePath = "/adopciones",
    fixedRefugioSlug,
    showFilters = true,
}: Props) {
    const query = {
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

    let data: { items?: unknown[]; total?: number; page?: number; pageSize?: number } | null = null;
    let errorMessage: string | null = null;

    try {
        const service = await createPublicCatalogService();
        const result = fixedRefugioSlug
            ? await service.listByRefugio(fixedRefugioSlug, query)
            : await service.listCatalog(query);
        data = result as { items?: unknown[]; total?: number; page?: number; pageSize?: number };
    } catch (error) {
        errorMessage = isAdoptionDomainError(error) ? error.message : "No pudimos cargar el catálogo de adopciones.";
    }

    if (errorMessage) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
                <h2 className="text-base font-semibold text-foreground">No pudimos cargar el catálogo</h2>
                <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
                <Link href={basePath} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary">Reintentar</Link>
            </div>
        );
    }

    const items = (data?.items ?? []) as Array<Record<string, unknown>>;
    const total = Number(data?.total ?? 0);
    const page = Number(data?.page ?? 1);
    const pageSize = Number(data?.pageSize ?? 12);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const buildHref = (nextPage: number) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(query)) {
            if (v && k !== "page" && k !== "refugio") params.set(k, String(v));
            if (!fixedRefugioSlug && k === "refugio" && v) params.set(k, String(v));
        }
        params.set("page", String(nextPage));
        return `${basePath}?${params.toString()}`;
    };

    return (
        <div className="space-y-6">
            {showFilters && <PublicCatalogFilters />}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>{total} animal(es) disponible(s)</p>
                {page > 1 || totalPages > 1 ? <p>Página {page} de {totalPages}</p> : null}
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon={SearchX}
                    title="No hay animales que coincidan con los filtros"
                    description="Prueba ajustando los filtros o limpia la búsqueda para ver más opciones."
                    action={showFilters ? <Link href={basePath} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Limpiar filtros</Link> : <Link href="/adopciones" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Ver catálogo</Link>}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {items.map((item) => (
                        <PublicAnimalCard key={String(item.id_animal)} item={item as unknown as CatalogItem} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <nav aria-label="Paginación" className="flex items-center justify-center gap-2">
                    <Link
                        href={buildHref(Math.max(1, page - 1))}
                        aria-disabled={page <= 1}
                        className={`inline-flex min-h-11 items-center rounded-xl border px-4 text-sm ${page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-secondary"}`}
                    >
                        Anterior
                    </Link>
                    <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                    <Link
                        href={buildHref(Math.min(totalPages, page + 1))}
                        aria-disabled={page >= totalPages}
                        className={`inline-flex min-h-11 items-center rounded-xl border px-4 text-sm ${page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-secondary"}`}
                    >
                        Siguiente
                    </Link>
                </nav>
            )}
        </div>
    );
}