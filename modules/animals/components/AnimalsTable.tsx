"use client";

import { useState } from "react";
import { PawPrint } from "lucide-react";
import {Animal} from "@/modules/animals/types/animales.types";
import {AnimalSearchBar} from "@/modules/animals/components/AnimalSearchBar";
import {AnimalDetailPanel} from "@/modules/animals/components/AnimalDetailPanel";


type Props = {
    animales: Animal[];
};

export function AnimalsTable({ animales }: Props) {
    const [busqueda, setBusqueda] = useState("");
    const [animalDetalle, setAnimalDetalle] = useState<Animal | null>(null);

    const filtrados = animales.filter((a) =>
        `${a.nombre ?? ""} ${a.especie} ${a.raza ?? ""}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()),
    );

    return (
        <>
            <AnimalSearchBar value={busqueda} onChange={setBusqueda} />

            {filtrados.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <PawPrint size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No hay animales registrados</p>
                    <p className="text-sm mt-1">
                        Registra el primer animal con el botón de arriba
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtrados.map((animal) => (
                        <AnimalCard
                            key={animal.idAnimal}
                            animal={animal}
                            onClick={() => setAnimalDetalle(animal)}
                        />
                    ))}
                </div>
            )}

            {animalDetalle && (
                <AnimalDetailPanel
                    animal={animalDetalle}
                    onClose={() => setAnimalDetalle(null)}
                />
            )}
        </>
    );
}

function AnimalCard({
                        animal,
                        onClick,
                    }: {
    animal: Animal;
    onClick: () => void;
}) {
    return (
        <div
            className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="font-semibold text-foreground text-sm">
                        {animal.nombre ?? `${animal.especie} sin nombre`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {animal.raza ?? animal.especie} ·{" "}
                        {animal.sexo === "M" ? "Macho" : "Hembra"}
                    </p>
                </div>
                {/*<span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                        animal.disponibleAdopcion
                            ? "bg-green-100 text-green-700"
                            : "bg-secondary text-muted-foreground"
                    }`}
                >
                    {animal.disponibleAdopcion ? "En adopción" : "No disponible"}
                </span>*/}
                <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                        animal.estadoNombre
                            ? "bg-green-100 text-green-700"
                            : "bg-secondary text-muted-foreground"
                    }`}
                >
                    {animal.estadoNombre}
                </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {animal.enCuarentena && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-600">
            Cuarentena
          </span>
                )}
                {animal.esterilizado && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600">
            Esterilizado
          </span>
                )}
            </div>

            <p className="text-xs text-muted-foreground mt-3">
                📍 {animal.espacioNombre}
            </p>
        </div>
    );
}