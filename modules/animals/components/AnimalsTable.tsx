"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    AlertTriangle,
    Building2,
    Cat,
    Dog,
    Eye,
    FileHeart,
    MapPin,
    PawPrint,
} from "lucide-react";
import type { Animal } from "@/modules/animals/types/animales.types";
import type { AnimalState } from "@/modules/animals/types/animal-state.types";
import type { Space } from "@/modules/spaces/types/types";
import { AnimalDetailPanel } from "@/modules/animals/components/AnimalDetailPanel";
import { AnimalFilterBar, type ShelterOption } from "@/modules/animals/components/AnimalFilterBar";
import {
    EMPTY_FILTERS,
    filterAnimals,
    formatEdad,
    type AnimalFilters,
} from "@/modules/animals/filters";

type Props = {
    animales: Animal[];
    estados: AnimalState[];
    /** Opciones de albergue (solo superadmin). Si está vacío no se muestra el filtro. */
    refugios: ShelterOption[];
    canEdit: boolean;
    canDelete: boolean;
    /** Solo veterinario/admin pueden registrar diagnósticos. */
    canDiagnose?: boolean;
    /** Espacios disponibles para reubicar al animal desde la edición. */
    espacios?: Space[];
};

function AnimalIcon({
    especie,
    size,
    strokeWidth,
    className,
}: {
    especie: string;
    size: number;
    strokeWidth: number;
    className?: string;
}) {
    const e = especie?.toLowerCase() ?? "";
    if (e.includes("perro")) {
        return (
            <Dog
                size={size}
                strokeWidth={strokeWidth}
                className={className}
                aria-hidden="true"
            />
        );
    }
    if (e.includes("gato")) {
        return (
            <Cat
                size={size}
                strokeWidth={strokeWidth}
                className={className}
                aria-hidden="true"
            />
        );
    }
    return (
        <PawPrint
            size={size}
            strokeWidth={strokeWidth}
            className={className}
            aria-hidden="true"
        />
    );
}

function getAnimalColor(especie: string) {
    const e = especie?.toLowerCase() ?? "";
    if (e.includes("perro")) return "from-amber-100 to-orange-100 text-amber-600";
    if (e.includes("gato")) return "from-purple-100 to-pink-100 text-purple-600";
    return "from-slate-100 to-gray-100 text-slate-600";
}

export function AnimalsTable({ animales, estados, refugios, canEdit, canDelete, canDiagnose = false, espacios = [] }: Props) {
    const [filters, setFilters] = useState<AnimalFilters>(EMPTY_FILTERS);
    // Se guarda el id (no el objeto) para que el panel refleje los datos nuevos
    // cuando la página se vuelve a cargar tras editar, y se cierre si el animal se da de baja.
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const filtrados = useMemo(() => filterAnimals(animales, filters), [animales, filters]);
    const seleccionado = useMemo(
        () => animales.find((a) => a.idAnimal === selectedId) ?? null,
        [animales, selectedId],
    );

    const showShelter = refugios.length > 0;

    return (
        <>
            <AnimalFilterBar
                filters={filters}
                onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                onClear={() => setFilters((prev) => ({ ...EMPTY_FILTERS, orden: prev.orden }))}
                estados={estados}
                refugios={refugios}
                total={animales.length}
                shown={filtrados.length}
            />

            {filtrados.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <PawPrint size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
                    {animales.length === 0 ? (
                        <>
                            <p className="font-medium">No hay animales registrados</p>
                            <p className="text-sm mt-1">
                                Registra el primer animal con el botón de arriba
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="font-medium">Ningún animal coincide con los filtros</p>
                            <p className="text-sm mt-1">Prueba quitando alguno para ver más resultados</p>
                        </>
                    )}
                </div>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                    {filtrados.map((animal) => (
                        <li key={animal.idAnimal}>
                            <AnimalCard
                                animal={animal}
                                showShelter={showShelter}
                                onClick={() => setSelectedId(animal.idAnimal)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {seleccionado && (
                <AnimalDetailPanel
                    animal={seleccionado}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canDiagnose={canDiagnose}
                    onClose={() => setSelectedId(null)}
                    espacios={espacios}
                />
            )}
        </>
    );
}

function AnimalCard({
    animal,
    showShelter,
    onClick,
}: {
    animal: Animal;
    showShelter: boolean;
    onClick: () => void;
}) {
    const colorClasses = getAnimalColor(animal.especie);
    const nombre = animal.nombre ?? `${animal.especie} sin nombre`;
    const portada = animal.imagenPortada ?? null;

    const detalles = [
        animal.raza ?? animal.especie,
        animal.sexo === "M" ? "Macho" : animal.sexo === "H" ? "Hembra" : null,
        animal.tamano,
    ].filter(Boolean);

    return (
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <button
                type="button"
                onClick={onClick}
                aria-label={`Ver detalle de ${nombre}`}
                className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
                <div
                    className={`relative h-36 overflow-hidden bg-gradient-to-br sm:h-40 ${colorClasses}`}
                >
                    {portada ? (
                        <>
                            <Image
                                src={portada}
                                alt={`Foto de ${nombre}`}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25" />
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <AnimalIcon
                                especie={animal.especie}
                                size={72}
                                strokeWidth={1.2}
                                className="opacity-90 transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-1.5 p-2.5 sm:p-3">
                        {animal.enCuarentena ? (
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[9px] font-semibold leading-tight text-white shadow-sm sm:max-w-[60%] sm:text-[10px]">
                                <AlertTriangle size={11} className="shrink-0" aria-hidden="true" />
                                <span className="truncate">AISLAMIENTO / RIESGO BIOLÓGICO</span>
                            </span>
                        ) : (
                            <span />
                        )}
                        {animal.estadoNombre && (
                            <span className="max-w-full truncate rounded-full bg-foreground/80 px-2 py-1 text-[10px] font-medium leading-tight text-background backdrop-blur-sm sm:text-xs">
                                {animal.estadoNombre}
                            </span>
                        )}
                    </div>
                </div>

                <div className="min-w-0 p-4">
                    <h3 className="truncate text-base font-semibold text-foreground">
                        {nombre}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {detalles.join(" · ")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatEdad(animal.edadEstimada)}
                    </p>

                    <div className="mt-3 flex min-h-[24px] flex-wrap items-center gap-1.5">
                        {animal.disponibleAdopcion && (
                            <span className="rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                                En adopción
                            </span>
                        )}
                        {animal.esterilizado && (
                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                Esterilizado
                            </span>
                        )}
                        {animal.vacunado && (
                            <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[11px] font-medium text-teal-700">
                                Vacunado
                            </span>
                        )}
                    </div>

                    <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                        {showShelter && (
                            <div className="flex items-center gap-1.5">
                                <Building2 size={12} className="shrink-0" aria-hidden="true" />
                                <span className="truncate">
                                    {animal.refugioNombre ?? "Sin albergue"}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">
                                {animal.espacioNombre ?? "Sin espacio"}
                            </span>
                        </div>
                    </div>
                </div>
            </button>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                <button
                    type="button"
                    onClick={onClick}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
                >
                    <Eye size={14} aria-hidden="true" />
                    Ver detalle
                </button>
                <Link
                    href={`/animales/${animal.idAnimal}/ficha-clinica`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                    <FileHeart size={14} aria-hidden="true" />
                    Ficha clínica
                </Link>
            </div>
        </article>
    );
}
