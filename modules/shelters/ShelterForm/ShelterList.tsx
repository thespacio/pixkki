import { ShelterCard } from './ShelterCard';

import { ShelterListItem} from '@/modules/shelters/types';
import {Button} from "@/components/ui/button";
import {getCurrentUser} from "@/modules/auth";
import {createShelterService} from "@/modules/shelters/factories";
import {Pagination, PaginationContent, PaginationItem, PaginationLink} from "@/components/ui/pagination";

/** Tamaño de página del tablero de refugios (F-SHELTER-01) */
const PAGE_SIZE = 9;

interface ShelterListProps {
    filters: {
        ciudad?: string;
        estado?: string;
        activo?: boolean;
        search?: string;
        page: number;
    };
}

function EmptyState({
                        title,
                        description,
                        action
                    }: {
    title: string;
    description: string;
    action?: { label: string; href: string; };
}) {
    return (
        <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
            <p className="text-muted-foreground mt-2">{description}</p>
            {action && (
                <Button className="mt-4" asChild>
                    <a href={action.href}>{action.label}</a>
                </Button>
            )}
        </div>
    );
}

/**
 * Construye la query string base conservando los filtros activos
 * para que la paginación no los pierda (F-SHELTER-05).
 */
function buildBaseQuery(filters: ShelterListProps['filters']): string {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.ciudad) params.set('ciudad', filters.ciudad);
    if (filters.estado) params.set('estado', filters.estado);
    if (filters.activo !== undefined) params.set('activo', String(filters.activo));

    return params.toString();
}

/**
 * Carga los datos del listado separada del render para no construir
 * JSX dentro de try/catch (react-hooks/error-boundaries).
 */
async function loadShelters(filters: ShelterListProps['filters']) {
    const service = await createShelterService();
    const user = await getCurrentUser();

    const page = filters.page > 0 ? filters.page : 1;

    const result = await service.findAll(
        {
            ciudad: filters.ciudad,
            estado: filters.estado,
            activo: filters.activo,
            search: filters.search,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
        },
        user
    );

    // F-SHELTER-01/03: el tablero global es del superadmin; solo él
    // ve el switch de activación.
    const canManage = user.role.trim().toLowerCase() === 'superadmin';

    return {
        shelters: result.data,
        pagination: result.pagination,
        canManage,
        baseQuery: buildBaseQuery(filters),
    };
}

export async function ShelterList({ filters }: ShelterListProps) {
    let loaded: Awaited<ReturnType<typeof loadShelters>> | null = null;

    try {
        loaded = await loadShelters(filters);
    } catch (error) {
        console.error('Error al cargar albergues:', error);
    }

    if (!loaded) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-destructive">
                    Error al cargar los albergues
                </h3>
                <p className="text-muted-foreground mt-2">
                    No se pudieron cargar los albergues. Por favor, intenta de nuevo.
                </p>
            </div>
        );
    }

    const { shelters, pagination, canManage, baseQuery } = loaded;

    if (shelters.length === 0) {
        return (
            <EmptyState
                title="No hay albergues registrados"
                description="Comienza creando tu primer albergue para comenzar a gestionar animales."
                action={{
                    label: "Crear albergue",
                    href: "/shelters/new"
                }}
            />
        );
    }

    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

    return (
        <div className="space-y-6">
            {/* Grid de albergues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelters.map((shelter: ShelterListItem) => (
                    <ShelterCard
                        key={shelter.id}
                        shelter={shelter}
                        canManage={canManage}
                    />
                ))}
            </div>

            {/* Paginación (conserva los filtros activos) */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    href={`?${baseQuery ? `${baseQuery}&` : ''}page=${index + 1}`}
                                    isActive={currentPage === index + 1}
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            )}

            {/* Información de resultados */}
            <div className="text-sm text-muted-foreground text-center">
                Mostrando {shelters.length} de {pagination.total} albergues
            </div>
        </div>
    );
}
