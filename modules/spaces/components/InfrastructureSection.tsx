'use client';

import SpacesTable from './SpacesTable';
import { Space } from '@/modules/spaces/types/types';

interface Props {
    shelterId: number;
    spaces: Space[];
}

export function InfrastructureSection({ shelterId, spaces }: Props) {
    return (
        <section className="mt-6">
            <SpacesTable shelterId={shelterId} spaces={spaces} />
        </section>
    );
}