// components/shelters/AdminFilters.tsx
// Versión sin useEffect

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {CIUDADES_POR_ESTADO} from "@/modules/catalogs/constants/mexican-states";

export function ShelterFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Inicializar directamente con los parámetros de búsqueda
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        ciudad: searchParams.get('ciudad') || '',
        estado: searchParams.get('estado') || '',
        activo: searchParams.get('activo') || '',
    });
    // El catálogo de ciudades depende del estado seleccionado: se
    // inicializa desde la URL para que funcione al recargar con filtros.
    const [selectedState, setSelectedState] = useState<Estado | "">(
        (searchParams.get('estado') || '') as Estado | ""
    );
    const updateFilters = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    const applyFilters = () => {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.ciudad) params.set('ciudad', filters.ciudad);
        if (filters.estado) params.set('estado', filters.estado);
        if (filters.activo) params.set('activo', filters.activo);

        params.set('page', '1');

        router.push(`/shelters?${params.toString()}`);
    };
    const clearFilters = () => {
        setFilters({
            search: '',
            ciudad: '',
            estado: '',
            activo: '',
        });
        router.push('/shelters');
    };
    const hasActiveFilters = () => {
        return filters.search !== '' ||
            filters.ciudad !== '' ||
            filters.estado !== '' ||
            filters.activo !== '';
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };
    // Tipo de las claves del objeto
    type Estado = keyof typeof CIUDADES_POR_ESTADO;
    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Buscar</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Nombre o ubicación..."
                                value={filters.search}
                                onChange={(e) => updateFilters('search', e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    {/*Select de Estados*/}
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                            value={filters.estado}
                            onValueChange={(value) => {
                                setSelectedState(value as Estado | "");
                                updateFilters('estado', value);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todos los estados</SelectItem>
                                {Object.keys(CIUDADES_POR_ESTADO).map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/*Select de Ciudades*/}
                    <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Select
                            value={filters.ciudad}
                            onValueChange={(value) => updateFilters('ciudad', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una ciudad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todas las ciudades</SelectItem>
                                {selectedState && CIUDADES_POR_ESTADO[selectedState as Estado]?.map((city) => (
                                    <SelectItem key={city} value={city}>
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                     {/*Ciudad
                    <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input
                            id="ciudad"
                            placeholder="Filtrar por ciudad..."
                            value={filters.ciudad}
                            onChange={(e) => updateFilters('ciudad', e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                     Estado
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                            value={filters.estado}
                            onValueChange={(value) => updateFilters('estado', value)}
                        >
                            <SelectTrigger id="estado">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todos los estados</SelectItem>
                                {Object.keys(CIUDADES_POR_ESTADO).map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>*/}

                    {/* Estado Activo */}
                    <div className="space-y-2">
                        <Label htmlFor="activo">Estado de Actividad</Label>
                        <Select
                            value={filters.activo}
                            onValueChange={(value) => updateFilters('activo', value)}
                        >
                            <SelectTrigger id="activo">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todos</SelectItem>
                                <SelectItem value="true">Activos</SelectItem>
                                <SelectItem value="false">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Button onClick={applyFilters}>
                        Aplicar filtros
                    </Button>
                    {hasActiveFilters() && (
                        <Button variant="outline" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}