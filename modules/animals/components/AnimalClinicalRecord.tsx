"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react";
import { getAnimalClinicalRecordAction } from "../actions/animal-expediente.actions";
import type { ClinicalRecord, ClinicalTimelineEvent } from "../services/clinical-record.service";

type Props = {
    idAnimal: number;
    refreshKey?: number;
    initialRecord?: ClinicalRecord;
    variant?: "panel" | "page";
};

const ALERTA_LABEL: Record<string, string> = {
    cuarentena: "AISLAMIENTO / RIESGO BIOLÓGICO",
    estado_critico: "Estado crítico",
};

function bannerTitle(alertas: string[]): string {
    const cuarentena = alertas.includes("cuarentena");
    const critico = alertas.includes("estado_critico");
    if (cuarentena && critico) return "AISLAMIENTO / RIESGO BIOLÓGICO y estado crítico";
    if (cuarentena) return "AISLAMIENTO / RIESGO BIOLÓGICO";
    return "Paciente en estado crítico";
}

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function describeEvent(event: ClinicalTimelineEvent): { titulo: string; detalle: string } {
    switch (event.tipo) {
        case "diagnostico":
            return { titulo: `Diagnóstico: ${event.detalle.estadoGeneral}`, detalle: event.detalle.observaciones ?? "" };
        case "vacuna":
            return { titulo: `${event.detalle.tipoEvento === "desparasitacion" ? "Desparasitación" : "Vacunación"}: ${event.detalle.tipoBiologico}`, detalle: event.detalle.observaciones ?? "" };
        case "prueba_temperamento":
            return { titulo: `Evaluación de temperamento: ${event.detalle.comportamiento ?? "—"}`, detalle: [event.detalle.nivelEnergia, event.detalle.aptoPerros, event.detalle.aptoGatos, event.detalle.aptoNinos].filter(Boolean).join(" · ") };
        case "esterilizacion":
            return { titulo: `Esterilización: ${event.detalle.tipoCirugia}`, detalle: event.detalle.notasPostoperatorias ?? "" };
        case "chequeo":
            return {
                titulo: `Chequeo médico`,
                detalle: `Peso ${event.detalle.pesoKg} kg · Temp ${event.detalle.temperaturaC} °C · FC ${event.detalle.frecuenciaCardiaca} lpm · FR ${event.detalle.frecuenciaRespiratoria} rpm${event.detalle.sintomas.length ? ` · Síntomas: ${event.detalle.sintomas.join(", ")}` : ""}${event.detalle.observaciones ? ` · ${event.detalle.observaciones}` : ""}`,
            };
        case "alta_cuarentena":
            return { titulo: "Alta médica de cuarentena", detalle: event.detalle.observaciones };
        default:
            return { titulo: "Evento clínico", detalle: "" };
    }
}

export function AnimalClinicalRecord({ idAnimal, refreshKey = 0, initialRecord, variant = "panel" }: Props) {
    const [ficha, setFicha] = useState<ClinicalRecord | null>(initialRecord ?? null);
    const [loading, setLoading] = useState(!initialRecord);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialRecord) {
            setFicha(initialRecord);
            setLoading(false);
            setError(null);
            return;
        }
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            const result = await getAnimalClinicalRecordAction(idAnimal);
            if (cancelled) return;
            if (result.success) setFicha(result.data);
            else setError(result.error);
            setLoading(false);
        }
        void load();
        return () => { cancelled = true; };
    }, [idAnimal, refreshKey, initialRecord]);

    const isPage = variant === "page";
    const content = loading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" aria-hidden="true" />Cargando ficha clínica…</p>
    ) : error ? (
        <p role="status" className="text-xs text-red-600">{error}</p>
    ) : ficha ? (
        <>
            {ficha.alertas.length > 0 && (
                <div role="status" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
                    <p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle size={16} aria-hidden="true" />{bannerTitle(ficha.alertas)}</p>
                    <p className="mt-1 text-xs">Requiere atención prioritaria.</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {ficha.alertas.map((alerta) => (
                            <span key={alerta} className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">{ALERTA_LABEL[alerta] ?? alerta}</span>
                        ))}
                    </div>
                </div>
            )}
            <dl className={`grid gap-3 text-xs ${isPage ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Animal</dt><dd className="text-foreground">{ficha.animal.nombre ?? `${ficha.animal.especie} sin nombre`}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Identidad</dt><dd className="break-all text-foreground">{ficha.animal.uuid ?? `#${ficha.animal.idAnimal}`}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Ingreso</dt><dd className="text-foreground">{formatFecha(ficha.animal.fechaIngreso)}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</dt><dd className="text-foreground">{ficha.animal.estadoNombre ?? "—"}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Espacio</dt><dd className="text-foreground">{ficha.animal.espacioNombre ?? "—"}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Último diagnóstico</dt><dd className="text-foreground">{ficha.diagnosticos[0]?.estadoGeneral ?? "—"}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Esterilizado</dt><dd className="text-foreground">{ficha.animal.esterilizado ? "Sí" : "No"}</dd></div>
            </dl>
            <h5 className="mb-2 mt-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><CalendarClock size={12} aria-hidden="true" />Línea de tiempo</h5>
            {ficha.lineaTiempo.length === 0 ? <p className="text-xs text-muted-foreground">Aún no hay eventos clínicos registrados.</p> : (
                <ol className="space-y-3">
                    {ficha.lineaTiempo.map((event, index) => {
                        const { titulo, detalle } = describeEvent(event);
                        return (
                            <li key={`${event.tipo}-${index}`} className="border-l-2 border-border pl-3">
                                <p className="text-[11px] text-muted-foreground">{formatFecha(event.fecha)}</p>
                                <p className="text-xs font-medium text-foreground">{titulo}</p>
                                {detalle && <p className="whitespace-pre-line text-xs text-muted-foreground">{detalle}</p>}
                            </li>
                        );
                    })}
                </ol>
            )}
        </>
    ) : null;

    if (isPage) return <div className="space-y-2">{content}</div>;
    return <section className="mt-6"><h4 className="mb-3 border-b border-border pb-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">Ficha clínica</h4>{content}</section>;
}
