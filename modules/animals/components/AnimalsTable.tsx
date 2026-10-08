"use client";

import { useState } from "react";
import { PawPrint, Cat, Dog, Bird, Rabbit, Fish, Turtle } from "lucide-react";
import { Animal } from "@/modules/animals/types/animales.types";
import { AnimalSearchBar } from "@/modules/animals/components/AnimalSearchBar";
import { AnimalDetailPanel } from "@/modules/animals/components/AnimalDetailPanel";

type Props = {
    animales: Animal[];
};

/**
 * Icono de especie con referencias estáticas a componentes
 * (evita crear componentes durante el render — react-hooks/static-components).
 */
type AnimalIconProps = {
    especie: string;
    size?: number;
    strokeWidth?: number;
    className?: string;
};

function AnimalIcon({ especie, size = 24, strokeWidth = 2, className }: AnimalIconProps) {
    const especieLower = especie?.toLowerCase() ?? "";

    if (especieLower.includes("perro") || especieLower.includes("can"))
        return <Dog size={size} strokeWidth={strokeWidth} className={className} />;
    if (especieLower.includes("gato") || especieLower.includes("fel"))
        return <Cat size={size} strokeWidth={strokeWidth} className={className} />;
    if (especieLower.includes("ave") || especieLower.includes("pájaro") || especieLower.includes("pajaro"))
        return <Bird size={size} strokeWidth={strokeWidth} className={className} />;
    if (especieLower.includes("conejo") || especieLower.includes("liebre"))
        return <Rabbit size={size} strokeWidth={strokeWidth} className={className} />;
    if (especieLower.includes("pez") || especieLower.includes("fish"))
        return <Fish size={size} strokeWidth={strokeWidth} className={className} />;
    if (especieLower.includes("tortuga") || especieLower.includes("reptil"))
        return <Turtle size={size} strokeWidth={strokeWidth} className={className} />;

    return <PawPrint size={size} strokeWidth={strokeWidth} className={className} />;
}

// Colores de fondo según especie para darle personalidad
const getAnimalColor = (especie: string) => {
    const especieLower = especie?.toLowerCase() ?? "";
    if (especieLower.includes("perro") || especieLower.includes("can"))
        return "from-amber-100 to-orange-100 text-amber-600";
    if (especieLower.includes("gato") || especieLower.includes("fel"))
        return "from-purple-100 to-pink-100 text-purple-600";
    if (especieLower.includes("ave") || especieLower.includes("pájaro") || especieLower.includes("pajaro"))
        return "from-sky-100 to-cyan-100 text-sky-600";
    if (especieLower.includes("conejo") || especieLower.includes("liebre"))
        return "from-rose-100 to-pink-100 text-rose-600";
    if (especieLower.includes("pez") || especieLower.includes("fish"))
        return "from-blue-100 to-indigo-100 text-blue-600";
    if (especieLower.includes("tortuga") || especieLower.includes("reptil"))
        return "from-emerald-100 to-green-100 text-emerald-600";
    return "from-slate-100 to-gray-100 text-slate-600";
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
    const colorClasses = getAnimalColor(animal.especie);

    return (
        <div
            onClick={onClick}
            className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            {/* Imagen / Icono representativo */}
            <div
                className={`relative h-40 bg-gradient-to-br ${colorClasses} flex items-center justify-center overflow-hidden`}
            >
                <AnimalIcon
                    especie={animal.especie}
                    size={80}
                    strokeWidth={1.2}
                    className="transition-transform duration-500 group-hover:scale-110 opacity-90"
                />

                {/* Badge de estado (esquina superior derecha) */}
                <span
                    className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${
                        animal.estadoNombre
                            ? "bg-green-500/90 text-white shadow-sm"
                            : "bg-gray-400/90 text-white shadow-sm"
                    }`}
                >
                    {animal.estadoNombre}
                </span>

                {/* Badge cuarentena (esquina superior izquierda) */}
                {animal.enCuarentena && (
                    <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium bg-orange-500/90 text-white shadow-sm">
                        ⚠ Cuarentena
                    </span>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4">
                <div className="mb-2">
                    <h3 className="font-semibold text-foreground text-base truncate">
                        {animal.nombre ?? `${animal.especie} sin nombre`}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {animal.raza ?? animal.especie} ·{" "}
                        {animal.sexo === "M" ? "Macho" : "Hembra"}
                    </p>
                </div>

                {/* Etiquetas */}
                <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                    {animal.esterilizado && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-medium">
                            Esterilizado
                        </span>
                    )}
                    {animal.enCuarentena && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-medium">
                            Cuarentena
                        </span>
                    )}
                </div>

                {/* Ubicación */}
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>📍</span>
                    <span className="truncate">{animal.espacioNombre}</span>
                </div>
            </div>
        </div>
    );
}