"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CIUDADES_POR_ESTADO } from "@/modules/catalogs/constants/mexican-states";

const ALL = "todos";
const ALL_CITIES = "todas";

type ShelterFiltersProps = {
    initial: {
        search: string;
        ciudad: string;
        estado: string;
        activo: string;
    };
    count: {
        shown: number;
        total: number;
    };
};

/**
 * Filtros del listado de refugios. Escriben en la URL para que la vista siga
 * siendo un Server Component y los filtros sobrevivan a la recarga.
 *
 * Los `Select` usan centinelas no vacíos (`todos` / `todas`): Radix no admite
 * `value=""` y lanzaría en tiempo de ejecución.
 */
export function ShelterFilters({ initial, count }: ShelterFiltersProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(initial.search);
    const [estado, setEstado] = useState(initial.estado || ALL);
    const [ciudad, setCiudad] = useState(initial.ciudad || ALL_CITIES);
    const [activo, setActivo] = useState(initial.activo || ALL);

    const hasActiveFilters =
        search.trim() !== "" ||
        estado !== ALL ||
        ciudad !== ALL_CITIES ||
        activo !== ALL;

    function applyFilters() {
        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (estado !== ALL) params.set("estado", estado);
        if (ciudad !== ALL_CITIES) params.set("ciudad", ciudad);
        if (activo !== ALL) params.set("activo", activo);
        params.set("page", "1");

        const query = params.toString();
        startTransition(() => {
            router.push(query ? `/refugios?${query}` : "/refugios");
        });
    }

    function clearFilters() {
        setSearch("");
        setEstado(ALL);
        setCiudad(ALL_CITIES);
        setActivo(ALL);
        startTransition(() => {
            router.push("/refugios");
        });
    }

    const ciudades =
        estado !== ALL
            ? CIUDADES_POR_ESTADO[
                  estado as keyof typeof CIUDADES_POR_ESTADO
              ] ?? []
            : [];

    return (
        <DataToolbar
            className="mb-6"
            count={count}
            search={
                <div className="relative">
                    <Search
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        aria-label="Buscar refugios por nombre o ubicación"
                        placeholder="Buscar por nombre o ubicación..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") applyFilters();
                        }}
                        className="pl-9"
                    />
                </div>
            }
            filters={
                <>
                    <Select
                        value={estado}
                        onValueChange={(value) => {
                            setEstado(value);
                            setCiudad(ALL_CITIES);
                        }}
                        disabled={isPending}
                    >
                        <SelectTrigger
                            aria-label="Filtrar por estado"
                            className="w-full md:w-44"
                        >
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Todos los estados</SelectItem>
                            {Object.keys(CIUDADES_POR_ESTADO).map((state) => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={ciudad}
                        onValueChange={setCiudad}
                        disabled={isPending || ciudades.length === 0}
                    >
                        <SelectTrigger
                            aria-label="Filtrar por ciudad"
                            className="w-full md:w-44"
                        >
                            <SelectValue placeholder="Ciudad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_CITIES}>
                                Todas las ciudades
                            </SelectItem>
                            {ciudades.map((city) => (
                                <SelectItem key={city} value={city}>
                                    {city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={activo}
                        onValueChange={setActivo}
                        disabled={isPending}
                    >
                        <SelectTrigger
                            aria-label="Filtrar por estado operativo"
                            className="w-full md:w-40"
                        >
                            <SelectValue placeholder="Estado operativo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Todos</SelectItem>
                            <SelectItem value="true">Activos</SelectItem>
                            <SelectItem value="false">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>
                </>
            }
            actions={
                <>
                    <Button onClick={applyFilters} disabled={isPending}>
                        {isPending ? "Filtrando..." : "Aplicar filtros"}
                    </Button>
                    {hasActiveFilters ? (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            disabled={isPending}
                        >
                            <X aria-hidden="true" />
                            Limpiar
                        </Button>
                    ) : null}
                </>
            }
        />
    );
}
