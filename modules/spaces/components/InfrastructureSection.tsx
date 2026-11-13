'use client';

import SpacesTable from './SpacesTable';
import { Space } from '@/modules/spaces/types/types';

interface Props {
    shelterId: number;
    spaces: Space[];
    canManage?: boolean;
}

export function InfrastructureSection({ shelterId, spaces, canManage = false }: Props) {
    return (
        <section className="mt-6">
            <SpacesTable shelterId={shelterId} spaces={spaces} canManage={canManage} />
        </section>
    );
}
