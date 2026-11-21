"use client";

// ---------------------------------------------------------------------------
// Único desplegable de la ficha rápida (P4 ley 2 / P5).
//
// Un solo control «Más datos del expediente», montado solo cuando está abierto.
// No se usan los acordeones de Radix: sus clases de animación requieren
// keyframes que no existen en el proyecto y el contenido cerrado quedaba
// visible.
// ---------------------------------------------------------------------------

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Animal } from "@/modules/animals/types/animales.types";
import { formatEdad } from "@/modules/animals/filters";

type Props = {
    animal: Animal;
    enCuarentena: boolean;
};

function Row({ label, value }: { label: string; value: ReactNode }) {
    const empty = value === null || value === undefined || value === "";
    return (
        <div className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className={`mt-0.5 truncate text-xs ${empty ? "text-muted-foreground" : "text-foreground"}`}>
                {empty ? "—" : value}
            </dd>
        </div>
    );
}

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

export function AnimalQuickDetails({ animal, enCuarentena }: Props) {
    const [open, setOpen] = useState(false);
    const contentId = `animal-detalles-${animal.idAnimal}`;

    return (
        <div className="mt-5">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls={contentId}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
            >
                Más datos del expediente
                <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <dl
                    id={contentId}
                    className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-border bg-card p-3"
                >
                    <Row label="Raza" value={animal.raza} />
                    <Row label="Tamaño" value={animal.tamano} />
                    <Row label="Color" value={animal.color} />
                    <Row label="Microchip" value={animal.microchip} />
                    <Row label="Procedencia" value={animal.procedencia} />
                    <Row label="Situación" value={animal.situacionRescate} />
                    <Row label="Lugar del rescate" value={animal.lugarRescate} />
                    <Row label="Fecha del rescate" value={formatFecha(animal.fechaRescate)} />
                    <Row label="Reportado por" value={animal.rescatistaNombre} />
                    <Row label="Contacto" value={animal.rescatistaContacto} />
                    <Row label="Albergue" value={animal.refugioNombre} />
                    <Row label="Espacio" value={animal.espacioNombre} />
                    <Row label="Ingreso" value={formatFecha(animal.fechaIngreso)} />
                    <Row label="Estado inicial" value={animal.estadoInicial} />
                    <Row label="Temperamento" value={animal.temperamento} />
                    <Row label="Vacunado" value={animal.vacunado ? "Sí" : "No"} />
                    <Row label="Desparasitado" value={animal.desparasitado ? "Sí" : "No"} />
                    <Row label="Esterilizado" value={animal.esterilizado ? "Sí" : "No"} />
                    <Row
                        label="Cuarentena"
                        value={
                            enCuarentena
                                ? "Sí (aislamiento activo)"
                                : "No (alta médica registrada)"
                        }
                    />
                    <Row label="Edad" value={animal.edadEstimada !== null ? formatEdad(animal.edadEstimada) : null} />
                    <div className="col-span-2">
                        <Row label="Observaciones" value={animal.observaciones} />
                    </div>
                </dl>
            )}
        </div>
    );
}
