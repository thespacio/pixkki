"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Building2, Cat, Dog, MapPin, PawPrint } from "lucide-react";
import type { Animal } from "@/modules/animals/types/animales.types";
import type { AnimalState } from "@/modules/animals/types/animal-state.types";
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
};

function getAnimalIcon(especie: string) {
    const e = especie?.toLowerCase() ?? "";
    if (e.includes("perro")) return Dog;
    if (e.includes("gato")) return Cat;
    return PawPrint;
}

function getAnimalColor(especie: string) {
    const e = especie?.toLowerCase() ?? "";
    if (e.includes("perro")) return "from-amber-100 to-orange-100 text-amber-600";
    if (e.includes("gato")) return "from-purple-100 to-pink-100 text-purple-600";
    return "from-slate-100 to-gray-100 text-slate-600";
}

export function AnimalsTable({ animales, estados, refugios, canEdit, canDelete }: Props) {
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                    onClose={() => setSelectedId(null)}
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
    const Icon = getAnimalIcon(animal.especie);
    const colorClasses = getAnimalColor(animal.especie);
    const nombre = animal.nombre ?? `${animal.especie} sin nombre`;

    const detalles = [
        animal.raza ?? animal.especie,
        animal.sexo === "M" ? "Macho" : animal.sexo === "H" ? "Hembra" : null,
        animal.tamano,
    ].filter(Boolean);

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Ver detalle de ${nombre}`}
            className="group relative block w-full text-left rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <div
                className={`relative h-36 bg-gradient-to-br ${colorClasses} flex items-center justify-center overflow-hidden`}
            >
                <Icon
                    size={72}
                    strokeWidth={1.2}
                    className="transition-transform duration-500 group-hover:scale-110 opacity-90"
                    aria-hidden="true"
                />

                {animal.estadoNombre && (
                    <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium bg-foreground/80 text-background backdrop-blur-sm">
                        {animal.estadoNombre}
                    </span>
                )}

                {animal.enCuarentena && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-orange-500/90 text-white shadow-sm">
                        <AlertTriangle size={11} aria-hidden="true" /> Cuarentena
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-foreground text-base truncate">{nombre}</h3>
                <p className="text-xs text-muted-foreground truncate">{detalles.join(" · ")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {formatEdad(animal.edadEstimada)}
                </p>

                <div className="mt-3 flex items-center gap-1.5 flex-wrap min-h-[24px]">
                    {animal.disponibleAdopcion && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-green-100 text-green-700 font-medium">
                            En adopción
                        </span>
                    )}
                    {animal.esterilizado && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-medium">
                            Esterilizado
                        </span>
                    )}
                    {animal.vacunado && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 font-medium">
                            Vacunado
                        </span>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                    {showShelter && (
                        <div className="flex items-center gap-1.5">
                            <Building2 size={12} aria-hidden="true" />
                            <span className="truncate">{animal.refugioNombre ?? "Sin albergue"}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <MapPin size={12} aria-hidden="true" />
                        <span className="truncate">{animal.espacioNombre ?? "Sin espacio"}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}
