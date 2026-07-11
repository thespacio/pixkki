// components/shelters/ShelterFilters.tsx
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

// Estados de México (constante fuera del componente)
const MEXICAN_STATES = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
    'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas'
];

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
        router.push('/shelter');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

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

                    {/* Ciudad */}
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

                    {/* Estado */}
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
                                {MEXICAN_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Estado Activo */}
                    <div className="space-y-2">
                        <Label htmlFor="activo">Estado</Label>
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
                    <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Limpiar filtros
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}