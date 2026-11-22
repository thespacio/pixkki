'use client';

import CreateSpaceModal from '@/modules/spaces/components/CreateSpaceModal';
import SpaceCard from '@/modules/spaces/components/SpaceCard';
import SpaceFilters from '@/modules/spaces/components/SpaceFilters';
import type { SpaceWithOccupancy } from '@/modules/spaces/types/types';

type Filters = {
    tipo: string;
    q: string;
    soloConCupo: boolean;
};

interface Props {
    spaces: SpaceWithOccupancy[];
    canManage: boolean;
    totalPlazasLibres: number;
    filters: Filters;
    error: string | null;
}

export default function SpaceClient({ spaces, canManage, totalPlazasLibres, filters, error }: Props) {
    const hasFilters = Boolean(filters.tipo || filters.q || filters.soloConCupo);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Espacios</h1>
                    <p className="text-muted-foreground mt-1">
                        {spaces.length} {spaces.length === 1 ? 'espacio' : 'espacios'} · {totalPlazasLibres}{' '}
                        {totalPlazasLibres === 1 ? 'plaza libre' : 'plazas libres'}
                    </p>
                </div>
                {canManage && <CreateSpaceModal />}
            </div>

            <div className="mb-6">
                <SpaceFilters tipo={filters.tipo} q={filters.q} soloConCupo={filters.soloConCupo} />
            </div>

            {error ? (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                    No se pudieron cargar los espacios. {error}
                </div>
            ) : null}

            {spaces.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                    <p className="text-base font-medium text-foreground">
                        {hasFilters ? 'No hay espacios que coincidan con los filtros' : 'Aún no hay espacios registrados'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {hasFilters
                            ? 'Prueba ajustando el tipo, la búsqueda o el filtro de cupo.'
                            : 'Crea el primer espacio para organizar la capacidad del refugio.'}
                    </p>
                    {canManage && !hasFilters && (
                        <div className="mt-4 flex justify-center">
                            <CreateSpaceModal />
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {spaces.map((space) => (
                        <SpaceCard key={space.id} space={space} canManage={canManage} />
                    ))}
                </div>
            )}
        </div>
    );
}