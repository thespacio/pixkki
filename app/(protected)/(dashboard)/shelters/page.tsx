// app/(dashboard)/shelters/page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShelterClient } from '@/modules/shelters/client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {ShelterFilters} from "@/modules/shelters/ShelterFilters";
import {ShelterSkeleton} from "@/modules/shelters/ShelterSkeleton";
import {ShelterList} from "@/modules/shelters/ShelterList";

export const metadata: Metadata = {
    title: 'Albergues - Sistema de Gestión',
    description: 'Lista de albergues registrados en el sistema',
};

interface PageProps {
    searchParams: {
        ciudad?: string;
        estado?: string;
        activo?: string;
        search?: string;
        page?: string;
        limit?: string;
    };
}

export default async function SheltersPage({ searchParams }: PageProps) {
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 10;
    const offset = (page - 1) * limit;

    // Preparar filtros desde los query params
    const filters = {
        ciudad: searchParams.ciudad,
        estado: searchParams.estado,
        activo: searchParams.activo === 'true' ? true :
            searchParams.activo === 'false' ? false : undefined,
        search: searchParams.search,
        limit: limit,
        offset: offset,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Albergues</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los albergues registrados en el sistema
                    </p>
                </div>
                <Link href="/shelters/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Albergue
                    </Button>
                </Link>
            </div>

             {/*Filtros */}
            <Suspense fallback={<div>Cargando filtros...</div>}>
                <ShelterFilters />
            </Suspense>

            {/* Lista de albergues */}
            <Suspense fallback={<ShelterSkeleton />}>
                <ShelterList filters={filters} />
            </Suspense>
        </div>
    );
}