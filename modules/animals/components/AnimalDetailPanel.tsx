"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Cat, Dog, PawPrint, Stethoscope, X } from "lucide-react";
import {
    deleteAnimalAction,
    updateAnimalAction,
} from "../actions/animal.actions";
import type { Animal } from "@/modules/animals/types/animales.types";
import { formatEdad } from "@/modules/animals/filters";

type Props = {
    animal: Animal;
    canEdit: boolean;
    canDelete: boolean;
    onClose: () => void;
};

function formatFecha(value: string | null): string | null {
    if (!value) return null;
    // `fecha_rescate` es DATE (YYYY-MM-DD): se interpreta como fecha local para no
    // restar un día por la zona horaria. `fecha_ingreso` puede traer hora.
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="mt-6">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 pb-1.5 border-b border-border">
                {title}
            </h4>
            <dl className="space-y-3 text-sm">{children}</dl>
        </section>
    );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
    const empty = value === null || value === undefined || value === "";
    return (
        <div>
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                {label}
            </dt>
            <dd className={empty ? "text-muted-foreground" : "text-foreground"}>
                {empty ? "—" : value}
            </dd>
        </div>
    );
}

export function AnimalDetailPanel({ animal, canEdit, canDelete, onClose }: Props) {
    const [pending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<
        { type: "ok" | "error"; msg: string } | null
    >(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    // `onClose` llega como función nueva en cada render del padre: se guarda en un
    // ref para que los efectos de abajo corran una sola vez (si no, el foco volvería
    // al botón "Cerrar" cada vez que cambia el estado del panel).
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Accesibilidad: foco inicial en "Cerrar" y cierre con Escape.
    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCloseRef.current();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const nombre = animal.nombre ?? `${animal.especie} sin nombre`;
    const Icon = animal.especie === "Perro" ? Dog : animal.especie === "Gato" ? Cat : PawPrint;
    const sexo = animal.sexo === "M" ? "Macho" : animal.sexo === "H" ? "Hembra" : "No determinado";

    function toggleDisponible() {
        setFeedback(null);
        startTransition(async () => {
            const result = await updateAnimalAction({
                id: animal.idAnimal,
                disponibleAdopcion: !animal.disponibleAdopcion,
            });
            setFeedback(
                result.success
                    ? {
                          type: "ok",
                          msg: animal.disponibleAdopcion
                              ? "Marcado como no disponible"
                              : "Marcado como disponible para adopción",
                      }
                    : { type: "error", msg: result.error },
            );
        });
    }

    function darDeBaja() {
        if (!confirm(`¿Dar de baja a ${nombre}?`)) return;
        setFeedback(null);
        startTransition(async () => {
            const result = await deleteAnimalAction(animal.idAnimal);
            if (result.success) {
                onClose();
            } else {
                setFeedback({ type: "error", msg: result.error });
            }
        });
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex justify-end"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="animal-detail-title"
                className="bg-background w-full max-w-md h-full overflow-y-auto shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground">Detalle del animal</h3>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon size={32} strokeWidth={1.4} aria-hidden="true" />
                    </div>
                    <h2 id="animal-detail-title" className="text-xl font-bold text-foreground">
                        {nombre}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {[animal.raza ?? animal.especie, sexo, animal.tamano].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-3 flex justify-center gap-2 flex-wrap">
                        {animal.estadoNombre && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground">
                                {animal.estadoNombre}
                            </span>
                        )}
                        {animal.enCuarentena && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-700">
                                Cuarentena
                            </span>
                        )}
                        {animal.disponibleAdopcion && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700">
                                En adopción
                            </span>
                        )}
                    </div>
                </div>

                {feedback && (
                    <div
                        role={feedback.type === "error" ? "alert" : "status"}
                        className={`mt-5 px-4 py-3 rounded-xl text-sm ${
                            feedback.type === "ok"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                    >
                        {feedback.msg}
                    </div>
                )}

                <Section title="Identificación">
                    <Row label="Especie" value={animal.especie} />
                    <Row label="Raza" value={animal.raza} />
                    <Row label="Sexo" value={sexo} />
                    <Row label="Edad estimada" value={animal.edadEstimada !== null ? formatEdad(animal.edadEstimada) : null} />
                    <Row label="Peso" value={animal.peso !== null ? `${animal.peso} kg` : null} />
                    <Row label="Tamaño" value={animal.tamano} />
                    <Row label="Color" value={animal.color} />
                    <Row label="Microchip" value={animal.microchip} />
                    <Row label="Rasgos físicos" value={animal.rasgosFisicos} />
                </Section>

                <Section title="Rescate">
                    <Row label="Procedencia" value={animal.procedencia} />
                    <Row label="Situación" value={animal.situacionRescate} />
                    <Row label="Lugar del rescate" value={animal.lugarRescate} />
                    <Row label="Fecha del rescate" value={formatFecha(animal.fechaRescate)} />
                    <Row label="Reportado por" value={animal.rescatistaNombre} />
                    <Row label="Contacto" value={animal.rescatistaContacto} />
                </Section>

                <Section title="Salud y comportamiento">
                    <Row label="Estado al ingreso" value={animal.estadoInicial} />
                    <Row label="Temperamento" value={animal.temperamento} />
                    <Row label="Vacunado" value={animal.vacunado ? "Sí" : "No"} />
                    <Row label="Desparasitado" value={animal.desparasitado ? "Sí" : "No"} />
                    <Row label="Esterilizado" value={animal.esterilizado ? "Sí" : "No"} />
                    <Row label="En cuarentena" value={animal.enCuarentena ? "Sí" : "No"} />
                </Section>

                <Section title="Albergue">
                    <Row label="Albergue" value={animal.refugioNombre} />
                    <Row label="Espacio" value={animal.espacioNombre} />
                    <Row label="Fecha de ingreso" value={formatFecha(animal.fechaIngreso)} />
                </Section>

                {animal.observaciones && (
                    <Section title="Observaciones">
                        <p className="text-sm text-foreground whitespace-pre-line">{animal.observaciones}</p>
                    </Section>
                )}

                {(canEdit || canDelete) && (
                    <div className="mt-8 space-y-3">
                        {canEdit && (
                            <button
                                onClick={toggleDisponible}
                                disabled={pending}
                                className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition disabled:opacity-60 ${
                                    animal.disponibleAdopcion
                                        ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                        : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                            >
                                {pending
                                    ? "Procesando..."
                                    : animal.disponibleAdopcion
                                        ? "Marcar como no disponible"
                                        : "Marcar disponible para adopción"}
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={darDeBaja}
                                disabled={pending}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-60"
                            >
                                Dar de baja
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Stethoscope size={12} aria-hidden="true" /> Expediente veterinario — próximamente
                    </p>
                </div>
            </div>
        </div>
    );
}
