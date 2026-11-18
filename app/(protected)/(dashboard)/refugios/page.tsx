import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus, SearchX } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/components/ui/utils";
import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import {
    getShelterDetailsByIdAction,
    getSheltersAction,
} from "@/modules/shelters/actions";
import type { Shelter } from "@/modules/shelters/types";
import { CreateShelterDialog } from "@/modules/shelters/ShelterForm/CreateShelterDialog";
import { ShelterCard } from "@/modules/shelters/ShelterForm/ShelterCard";
import { ShelterFilters } from "@/modules/shelters/ShelterForm/ShelterFilters";
import { ShelterStatusDialog } from "@/modules/shelters/ShelterForm/ShelterStatusDialog";

export const metadata: Metadata = {
    title: "Refugios",
    description: "Refugios registrados en la plataforma Pixkki.",
};

const PAGE_SIZE = 9;

type RefugiosSearchParams = {
    ciudad?: string;
    estado?: string;
    activo?: string;
    search?: string;
    page?: string;
    nuevo?: string;
    confirmar?: string;
};

type RefugiosPageProps = {
    searchParams: RefugiosSearchParams;
};

function parsePage(value: string | undefined): number {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseActivo(value: string | undefined): boolean | undefined {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
}

export default async function RefugiosPage({
    searchParams,
}: RefugiosPageProps) {
    const user = await getCurrentUser();

    if (!isSuperadmin(user)) {
        return (
            <div className="mx-auto max-w-3xl p-6 md:p-8">
                <EmptyState
                    icon={Building2}
                    title="Sección exclusiva del superadministrador"
                    description="Solo el superadministrador puede consultar y administrar el listado global de refugios."
                    action={
                        <Button asChild>
                            <Link href="/dashboard">Volver al panel</Link>
                        </Button>
                    }
                />
            </div>
        );
    }

    const page = parsePage(searchParams.page);
    const filters = {
        ciudad: searchParams.ciudad,
        estado: searchParams.estado,
        activo: parseActivo(searchParams.activo),
        search: searchParams.search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
    };

    const result = await getSheltersAction(filters);
    const shelters = result.data ?? [];
    const total = result.pagination?.total ?? shelters.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const hasFilters = Boolean(
        filters.search || filters.ciudad || filters.estado || filters.activo !== undefined,
    );

    let confirmShelter: Shelter | null = null;
    const confirmId = Number(searchParams.confirmar);

    if (Number.isInteger(confirmId) && confirmId > 0) {
        try {
            const detail = await getShelterDetailsByIdAction(confirmId);
            confirmShelter = detail.data;
        } catch {
            // El id no existe o no es accesible: se ignora el overlay.
            confirmShelter = null;
        }
    }

    function buildPageHref(target: number): string {
        const params = new URLSearchParams();

        if (filters.search) params.set("search", filters.search);
        if (filters.ciudad) params.set("ciudad", filters.ciudad);
        if (filters.estado) params.set("estado", filters.estado);
        if (filters.activo !== undefined) {
            params.set("activo", String(filters.activo));
        }
        if (target > 1) params.set("page", String(target));

        const query = params.toString();
        return query ? `/refugios?${query}` : "/refugios";
    }

    const visiblePages = Array.from(
        { length: totalPages },
        (_, index) => index + 1,
    ).filter(
        (candidate) =>
            candidate === 1 ||
            candidate === totalPages ||
            Math.abs(candidate - page) <= 1,
    );

    return (
        <div className="mx-auto max-w-7xl p-6 md:p-8">
            <PageHeader
                title="Refugios"
                description="Refugios registrados en la plataforma. Solo el superadministrador puede darlos de alta o cambiar su estado operativo."
                actions={
                    <Button asChild size="lg">
                        <Link href="/refugios?nuevo=1">
                            <Plus aria-hidden="true" />
                            Nuevo refugio
                        </Link>
                    </Button>
                }
            />

            <ShelterFilters
                initial={{
                    search: searchParams.search ?? "",
                    ciudad: searchParams.ciudad ?? "",
                    estado: searchParams.estado ?? "",
                    activo: searchParams.activo ?? "",
                }}
                count={{ shown: shelters.length, total }}
            />

            {shelters.length === 0 ? (
                hasFilters ? (
                    <EmptyState
                        icon={SearchX}
                        title="Ningún refugio coincide con los filtros"
                        description="Ajusta la búsqueda o limpia los filtros para ver el resto del listado."
                        action={
                            <Button asChild variant="outline">
                                <Link href="/refugios">Limpiar filtros</Link>
                            </Button>
                        }
                    />
                ) : (
                    <EmptyState
                        icon={Building2}
                        title="Aún no hay refugios registrados"
                        description="Da de alta el primer refugio y su administrador para empezar a operar."
                        action={
                            <Button asChild size="lg">
                                <Link href="/refugios?nuevo=1">
                                    Dar de alta un refugio
                                </Link>
                            </Button>
                        }
                    />
                )
            ) : (
                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shelters.map((shelter) => (
                        <li key={shelter.id}>
                            <ShelterCard shelter={shelter} />
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 ? (
                <Pagination className="mt-8">
                    <PaginationContent>
                        {visiblePages.map((target) => (
                            <PaginationItem key={target}>
                                <Link
                                    href={buildPageHref(target)}
                                    aria-current={
                                        target === page ? "page" : undefined
                                    }
                                    aria-label={`Página ${target}`}
                                    className={cn(
                                        buttonVariants({
                                            variant:
                                                target === page
                                                    ? "outline"
                                                    : "ghost",
                                            size: "icon",
                                        }),
                                    )}
                                >
                                    {target}
                                </Link>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            ) : null}

            {searchParams.nuevo === "1" ? <CreateShelterDialog /> : null}

            {searchParams.nuevo !== "1" && confirmShelter ? (
                <ShelterStatusDialog
                    id={confirmShelter.id}
                    name={confirmShelter.nombre_albergue}
                    activo={confirmShelter.activo}
                />
            ) : null}
        </div>
    );
}
