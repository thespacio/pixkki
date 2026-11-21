"use client";

// ---------------------------------------------------------------------------
// Resumen de la ficha rápida: solo lo que el operador necesita para decidir.
// Identidad, estado, ubicación, tres datos clave y dos accesos directos
// (diagnóstico y fotos). El resto vive en un único desplegable.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Cat,
    Dog,
    Images,
    MapPin,
    PawPrint,
    ShieldCheck,
    ShieldPlus,
    Stethoscope,
} from "lucide-react";
import type { Animal } from "@/modules/animals/types/animales.types";
import { formatEdad } from "@/modules/animals/filters";
import {
    getAnimalDiagnosesAction,
    getAnimalImagesAction,
} from "../actions/animal-expediente.actions";
import type { AnimalDiagnosis } from "../repositories/animal-diagnosis.repository";

type Props = {
    animal: Animal;
    enCuarentena: boolean;
    canRelease: boolean;
    canDiagnose: boolean;
    refreshKey: number;
    onRequestRelease: () => void;
    onRequestDiagnosis: () => void;
    onOpenGallery: () => void;
};

function formatFecha(value: string | null): string | null {
    if (!value) return null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

const ESTADO_BADGE: Record<string, string> = {
    Crítico: "bg-red-100 text-red-700",
    Delicado: "bg-orange-100 text-orange-700",
    Estable: "bg-blue-100 text-blue-700",
    Sano: "bg-green-100 text-green-700",
};

export function AnimalQuickSummary({
    animal,
    enCuarentena,
    canRelease,
    canDiagnose,
    refreshKey,
    onRequestRelease,
    onRequestDiagnosis,
    onOpenGallery,
}: Props) {
    const [ultimo, setUltimo] = useState<AnimalDiagnosis | null | undefined>(
        undefined,
    );
    const [fotos, setFotos] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const [diagnosticos, imagenes] = await Promise.all([
                getAnimalDiagnosesAction(animal.idAnimal),
                getAnimalImagesAction(animal.idAnimal),
            ]);
            if (cancelled) return;
            setUltimo(diagnosticos.success ? (diagnosticos.data[0] ?? null) : null);
            setFotos(imagenes.success ? imagenes.data.length : null);
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [animal.idAnimal, refreshKey]);

    const nombre = animal.nombre ?? `${animal.especie} sin nombre`;
    const Icon =
        animal.especie === "Perro" ? Dog : animal.especie === "Gato" ? Cat : PawPrint;
    const critico = ultimo?.estadoGeneral === "Crítico";

    return (
        <>
            <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon size={32} strokeWidth={1.4} aria-hidden="true" />
                </div>
                <h2 id="animal-detail-title" className="text-xl font-bold text-foreground">
                    {nombre}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {[animal.raza ?? animal.especie, animal.tamano]
                        .filter(Boolean)
                        .join(" · ")}
                </p>
                <div className="mt-3 flex justify-center gap-2 flex-wrap">
                    {animal.estadoNombre && (
                        <span className="rounded-lg bg-secondary px-2 py-1 text-xs text-foreground">
                            {animal.estadoNombre}
                        </span>
                    )}
                    {enCuarentena && (
                        <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            AISLAMIENTO / RIESGO BIOLÓGICO
                        </span>
                    )}
                    {animal.disponibleAdopcion && (
                        <span className="rounded-lg bg-green-100 px-2 py-1 text-xs text-green-700">
                            En adopción
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {enCuarentena ? (
                    <div
                        role="status"
                        className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800"
                    >
                        <p className="flex items-center gap-2 text-sm font-semibold">
                            <AlertTriangle size={16} aria-hidden="true" />
                            AISLAMIENTO / RIESGO BIOLÓGICO
                        </p>
                        <p className="mt-1 text-xs">
                            Ingreso: {formatFecha(animal.fechaIngreso)} · Sin traslado a
                            áreas generales hasta el alta médica.
                        </p>
                        {canRelease && (
                            <button
                                type="button"
                                onClick={onRequestRelease}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                                <ShieldPlus size={13} aria-hidden="true" />
                                Alta médica
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-800">
                        <ShieldCheck size={15} aria-hidden="true" />
                        Cuarentena finalizada
                    </div>
                )}

                {critico && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
                        Estado crítico: requiere atención prioritaria.
                    </p>
                )}

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={14} aria-hidden="true" />
                    {[animal.refugioNombre, animal.espacioNombre].filter(Boolean).join(" · ") ||
                        "Sin ubicación registrada"}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                        ["Edad", animal.edadEstimada !== null ? formatEdad(animal.edadEstimada) : "—"],
                        ["Sexo", animal.sexo === "M" ? "Macho" : animal.sexo === "H" ? "Hembra" : "—"],
                        ["Peso", animal.peso !== null ? `${animal.peso} kg` : "—"],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-border bg-card p-2">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {label}
                            </p>
                            <p className="text-xs font-semibold text-foreground">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="divide-y divide-border rounded-xl border border-border bg-card px-3 text-xs">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Stethoscope size={13} aria-hidden="true" />
                            Diagnóstico
                        </span>
                        <span className="flex items-center gap-2">
                            {ultimo === undefined ? (
                                <span className="text-muted-foreground">Cargando…</span>
                            ) : ultimo ? (
                                <span
                                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                        ESTADO_BADGE[ultimo.estadoGeneral] ??
                                        "bg-secondary text-foreground"
                                    }`}
                                >
                                    {ultimo.estadoGeneral}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Sin registrar</span>
                            )}
                            {canDiagnose && (
                                <button
                                    type="button"
                                    onClick={onRequestDiagnosis}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Registrar
                                </button>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Images size={13} aria-hidden="true" />
                            Fotos
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                                {fotos === null ? "—" : fotos}
                            </span>
                            <button
                                type="button"
                                onClick={onOpenGallery}
                                className="font-semibold text-primary hover:underline"
                            >
                                Ver galería
                            </button>
                        </span>
                    </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                    El diagnóstico no libera la cuarentena. Solo lo hace el alta médica.
                </p>
            </div>
        </>
    );
}
