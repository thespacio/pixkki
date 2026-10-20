
import { ShelterClient } from '@/modules/shelters/client';
import { ShelterCard } from './ShelterCard';


import { ShelterFilters as ShelterFiltersType, ShelterListItem} from '@/modules/shelters/types';
import {Button} from "@/components/ui/button";
import {getCurrentUser} from "@/modules/auth";
import {createShelterService} from "@/modules/shelters/factories";
import {Pagination, PaginationContent, PaginationItem, PaginationLink} from "@/components/ui/pagination";


interface ShelterListProps {
    filters: {
        ciudad?: string;
        estado?: string;
        activo?: boolean;
        search?: string;
        limit: number;
        offset: number;
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

export async function ShelterList({ filters }: ShelterListProps) {
    const service = await createShelterService();
    const user = await getCurrentUser();

    const page = Number(filters.page ?? 1);
    const limit = 9;

    const result = await service.findAll(
        {
            ciudad: filters.ciudad,
            estado: filters.estado,
            activo: filters.activo,
            search: filters.search,
            limit,
            offset: (page - 1) * limit,
        },
        user
    );
    console.log({
        page,
        limit,
        offset: (page - 1) * limit,
    });


    if (!result.data || result.data.length === 0) {
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

    const {data: shelters, pagination} = result;
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

    const goToPage = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        window.location.search = params.toString();
    };

    try {

    } catch (error) {
        console.error('Error al cargar albergues:', error);
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-destructive">
                    Error al cargar los albergues
                </h3>
                <p className="text-muted-foreground mt-2">
                    No se pudieron cargar los albergues. Por favor, intenta de nuevo.
                </p>
                <Button
                    variant="outline"
                    className="mt-4"
                >
                    Reintentar
                </Button>
            </div>
        );
    }
    console.log(result.pagination);
    console.log(result.data.length);
    return (
        <div className="space-y-6">
            {/* Grid de albergues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelters.map((shelter: ShelterListItem) => (
                        <ShelterCard key={shelter.id} shelter={shelter} />
                    ))}
                </div>

                {/* Paginación */}
                <Pagination>
                    <PaginationContent>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    href={`?page=${index + 1}`}
                                    isActive={currentPage === index + 1}
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>

                {/* Información de resultados */}
                <div className="text-sm text-muted-foreground text-center">
                    Mostrando {shelters.length} de {pagination.total} albergues
                </div>
            </div>
        );
}
