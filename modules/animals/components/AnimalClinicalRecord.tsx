"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react";
import { getAnimalClinicalRecordAction } from "../actions/animal-expediente.actions";
import type {
    ClinicalRecord,
    ClinicalTimelineEvent,
} from "../services/clinical-record.service";

type Props = {
    idAnimal: number;
};

const ALERTA_LABEL: Record<string, string> = {
    cuarentena: "En cuarentena",
    estado_critico: "Estado crítico",
};

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function describeEvent(event: ClinicalTimelineEvent): {
    titulo: string;
    detalle: string | null;
} {
    switch (event.tipo) {
        case "diagnostico":
            return {
                titulo: `Diagnóstico: ${event.detalle.estadoGeneral}`,
                detalle: event.detalle.observaciones,
            };
        case "vacuna":
            return {
                titulo: `Vacuna: ${event.detalle.tipoBiologico}`,
                detalle: event.detalle.observaciones,
            };
        case "prueba_temperamento":
            return {
                titulo: "Evaluación de temperamento",
                detalle: event.detalle.comportamiento,
            };
        case "esterilizacion":
            return {
                titulo: `Esterilización: ${event.detalle.tipoCirugia}`,
                detalle: event.detalle.notasPostoperatorias,
            };
    }
}

/**
 * Ficha clínica consolidada (RF1.4, US08).
 * Muestra alertas y la línea de tiempo clínica del expediente.
 */
export function AnimalClinicalRecord({ idAnimal }: Props) {
    const [ficha, setFicha] = useState<ClinicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const result = await getAnimalClinicalRecordAction(idAnimal);
            if (cancelled) return;

            if (result.success) {
                setFicha(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [idAnimal]);

    return (
        <section className="mt-6">
            <h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                Ficha clínica
            </h4>

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando ficha clínica…
                </p>
            ) : error ? (
                <p role="status" className="text-xs text-red-600">
                    {error}
                </p>
            ) : ficha ? (
                <>
                    {ficha.alertas.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {ficha.alertas.map((alerta) => (
                                <span
                                    key={alerta}
                                    className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700"
                                >
                                    <AlertTriangle size={11} aria-hidden="true" />
                                    {ALERTA_LABEL[alerta] ?? alerta}
                                </span>
                            ))}
                        </div>
                    )}

                    <dl className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Identidad
                            </dt>
                            <dd className="break-all text-foreground">
                                {ficha.animal.uuid ?? "Sin UUID"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Ingreso
                            </dt>
                            <dd className="text-foreground">
                                {formatFecha(ficha.animal.fechaIngreso)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Estado
                            </dt>
                            <dd className="text-foreground">
                                {ficha.animal.estadoNombre ?? "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Espacio
                            </dt>
                            <dd className="text-foreground">
                                {ficha.animal.espacioNombre ?? "—"}
                            </dd>
                        </div>
                    </dl>

                    <h5 className="mb-2 mt-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <CalendarClock size={12} aria-hidden="true" />
                        Línea de tiempo
                    </h5>

                    {ficha.lineaTiempo.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            Aún no hay eventos clínicos registrados.
                        </p>
                    ) : (
                        <ol className="space-y-3">
                            {ficha.lineaTiempo.map((event, index) => {
                                const { titulo, detalle } = describeEvent(event);
                                return (
                                    <li
                                        key={`${event.tipo}-${index}`}
                                        className="border-l-2 border-border pl-3"
                                    >
                                        <p className="text-[11px] text-muted-foreground">
                                            {formatFecha(event.fecha)}
                                        </p>
                                        <p className="text-xs font-medium text-foreground">
                                            {titulo}
                                        </p>
                                        {detalle && (
                                            <p className="whitespace-pre-line text-xs text-muted-foreground">
                                                {detalle}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </>
            ) : null}
        </section>
    );
}
