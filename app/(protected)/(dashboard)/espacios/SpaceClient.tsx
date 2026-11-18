'use client';

import CreateSpaceModal from '@/app/(protected)/(dashboard)/espacios/CreateSpaceModal';
import { Space } from '@/modules/spaces/types/types';
import {InfrastructureSection} from "@/modules/spaces/components/InfrastructureSection";


interface Props {
    shelterId?: number;
    spaces: Space[];
    canManage?: boolean;
}

export default function SpaceClient({ shelterId, spaces, canManage = false }: Props) {
    if (!shelterId) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No autorizado</p>
                    <p className="text-muted-foreground">ID: {shelterId}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Espacios</h1>
                <p className="text-muted-foreground mt-1">
                    Completa los siguientes datos para registrar un nuevo espacio en tu albergue
                </p>
            </div>

            <div className="mt-8">
                {canManage && <CreateSpaceModal shelterId={shelterId} />}

                <InfrastructureSection
                    shelterId={shelterId}
                    spaces={spaces}
                    canManage={canManage}
                />
            </div>
        </div>
    );
}
