import { getCurrentUser } from '@/modules/auth';
import { isAdmin, isSuperadmin } from '@/modules/auth/authorization';
import { getSpacesWithOccupancyAction } from '@/modules/spaces/actions';
import SpaceClient from '@/app/(protected)/(dashboard)/espacios/SpaceClient';

type PageProps = {
    searchParams?: {
        tipo?: string;
        q?: string;
        soloConCupo?: string;
    };
};

export default async function EspaciosPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    const canManage = isAdmin(user) || isSuperadmin(user);
    const tipo = typeof searchParams?.tipo === 'string' ? searchParams.tipo : undefined;
    const q = typeof searchParams?.q === 'string' ? searchParams.q : undefined;
    const soloConCupo = searchParams?.soloConCupo === '1';

    const filters = {
        ...(tipo ? { type: tipo } : {}),
        ...(q ? { searchTerm: q } : {}),
    };

    const res = await getSpacesWithOccupancyAction(filters, { onlyWithCapacity: soloConCupo });
    const spaces = res.success ? res.data : [];
    const error = res.success ? null : res.error;

    const totalPlazasLibres = spaces.reduce((acc, space) => acc + space.capacidadLibre, 0);

    return (
        <SpaceClient
            spaces={spaces}
            canManage={canManage}
            totalPlazasLibres={totalPlazasLibres}
            filters={{ tipo: tipo ?? '', q: q ?? '', soloConCupo }}
            error={error}
        />
    );
}
