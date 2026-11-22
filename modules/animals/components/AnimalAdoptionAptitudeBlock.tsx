"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Loader2,
    ShieldAlert,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getAnimalAdoptionAptitudeAction,
    setAnimalAdoptionAvailabilityAction,
} from "../actions/animal-poblacional.actions";
import type { AdoptionAptitude, AdoptionCriterion } from "../repositories/animal-adoption.repository";
import { AdoptionExceptionDialog } from "./AdoptionExceptionDialog";

type Props = {
    idAnimal: number;
    canEdit: boolean;
    canAuthorizeException: boolean;
    refreshKey?: number;
    onChanged?: () => void;
};

function criterioIcon(cumple: boolean, detalle: string) {
    if (cumple) return <CheckCircle2 size={16} className="text-green-600" aria-hidden="true" />;
    if (detalle.toLowerCase().includes("advertencia") || detalle.toLowerCase().includes("no verificable")) {
        return <AlertCircle size={16} className="text-amber-600" aria-hidden="true" />;
    }
    return <XCircle size={16} className="text-red-600" aria-hidden="true" />;
}

function estadoGlobal(aptitud: AdoptionAptitude): {
    label: string;
    className: string;
    icon: React.ReactNode;
} {
    if (aptitud.disponibleAdopcion && aptitud.excepcionVigente) {
        return {
            label: "Apto con excepción",
            className: "border-amber-200 bg-amber-50 text-amber-800",
            icon: <ShieldAlert size={14} aria-hidden="true" />,
        };
    }
    if (aptitud.apto) {
        return {
            label: "Apto para publicar",
            className: "border-green-200 bg-green-100 text-green-700",
            icon: <ShieldCheck size={14} aria-hidden="true" />,
        };
    }
    return {
        label: "No apto",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: <ShieldAlert size={14} aria-hidden="true" />,
    };
}

function criterioEstadoLabel(criterio: AdoptionCriterion): string {
    if (criterio.cumple) return "Cumple";
    return criterio.omitible ? "Bloqueo omitible" : "Bloqueo no omitible";
}

export function AnimalAdoptionAptitudeBlock({
    idAnimal,
    canEdit,
    canAuthorizeException,
    refreshKey = 0,
    onChanged,
}: Props) {
    const [aptitud, setAptitud] = useState<AdoptionAptitude | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [exceptionOpen, setExceptionOpen] = useState(false);
    const [focusedClave, setFocusedClave] = useState<string | null>(null);
    const criterionRefs = useRef<Record<string, HTMLLIElement | null>>({});

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        const result = await getAnimalAdoptionAptitudeAction(idAnimal);
        if (result.success) {
            setAptitud(result.data);
        } else {
            setLoadError(result.error);
        }
        setLoading(false);
    }, [idAnimal]);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            setLoading(true);
            setLoadError(null);
            const result = await getAnimalAdoptionAptitudeAction(idAnimal);
            if (cancelled) return;
            if (result.success) {
                setAptitud(result.data);
            } else {
                setLoadError(result.error);
            }
            setLoading(false);
        }
        void run();
        return () => {
            cancelled = true;
        };
    }, [idAnimal, refreshKey]);

    useEffect(() => {
        if (!focusedClave) return;
        const el = criterionRefs.current[focusedClave];
        if (el) {
            el.scrollIntoView({ block: "nearest", behavior: "smooth" });
            const focusable = el.querySelector<HTMLElement>("button, a, [tabindex]");
            (focusable ?? el).focus?.();
        }
    }, [focusedClave, aptitud]);

    async function publicar() {
        if (!aptitud) return;
        setActionError(null);
        setActionSuccess(null);
        setFocusedClave(null);
        setSaving(true);
        const result = await setAnimalAdoptionAvailabilityAction(idAnimal, {
            disponible_adopcion: true,
            autorizar_excepcion: false,
            motivo_excepcion: null,
        });
        setSaving(false);

        if (!result.success) {
            const bloqueos = Array.isArray(result.details && (result.details as { bloqueos?: unknown }).bloqueos)
                ? ((result.details as { bloqueos: unknown[] }).bloqueos.filter((b): b is string => typeof b === "string"))
                : [];
            if (result.code === "APTITUD_ADOPCION_INSUFICIENTE") {
                setActionError("No se puede publicar: revisa los criterios marcados.");
                setExpanded(true);
                if (bloqueos.length > 0) setFocusedClave(bloqueos[0]);
                return;
            }
            setActionError(result.error);
            if (bloqueos.length > 0) {
                setExpanded(true);
                setFocusedClave(bloqueos[0]);
            }
            return;
        }

        setActionSuccess("El paciente fue publicado para adopción.");
        await load();
        onChanged?.();
    }

    async function despublicar() {
        if (!confirm("¿Despublicar a este paciente de adopción?")) return;
        setActionError(null);
        setActionSuccess(null);
        setSaving(true);
        const result = await setAnimalAdoptionAvailabilityAction(idAnimal, {
            disponible_adopcion: false,
            autorizar_excepcion: false,
            motivo_excepcion: null,
        });
        setSaving(false);

        if (!result.success) {
            setActionError(result.error);
            return;
        }

        setActionSuccess("El paciente fue despublicado de adopción.");
        await load();
        onChanged?.();
    }

    const global = aptitud ? estadoGlobal(aptitud) : null;
    const bloqueosOmitibles = aptitud?.criterios.filter((c) => !c.cumple && c.omitible) ?? [];
    const hayBloqueosNoOmitibles = aptitud?.criterios.some((c) => !c.cumple && !c.omitible) ?? false;
    const mostrarPublicar = Boolean(aptitud && canEdit && !aptitud.disponibleAdopcion);
    const puedeDespublicar = Boolean(aptitud && canEdit && aptitud.disponibleAdopcion);
    const mostrarExcepcion = Boolean(
        aptitud &&
            canAuthorizeException &&
            !aptitud.apto &&
            !aptitud.disponibleAdopcion &&
            bloqueosOmitibles.length > 0 &&
            !hayBloqueosNoOmitibles,
    );

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">Aptitud para adopción</h2>
                        {global && (
                            <Badge variant="outline" className={global.className}>
                                <span className="inline-flex items-center gap-1">
                                    {global.icon}
                                    {global.label}
                                </span>
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Gatekeeper de publicación basado en criterios clínicos y de comportamiento.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {puedeDespublicar && (
                        <Button type="button" variant="outline" size="sm" onClick={() => void despublicar()} disabled={saving}>
                            {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
                            Despublicar
                        </Button>
                    )}
                    {mostrarPublicar && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => void publicar()}
                            disabled={saving || !aptitud?.apto}
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
                            Publicar para adopción
                        </Button>
                    )}
                    {mostrarExcepcion && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => setExceptionOpen(true)} disabled={saving}>
                            Autorizar excepción
                        </Button>
                    )}
                </div>
            </div>

            {actionError && (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {actionError}
                </p>
            )}
            {actionSuccess && (
                <p role="status" className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                    {actionSuccess}
                </p>
            )}

            {loading ? (
                <div className="mt-4 space-y-2" aria-hidden="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : loadError ? (
                <div role="status" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="font-medium">No se pudo cargar la aptitud de adopción.</p>
                        <p className="text-xs text-red-600">{loadError}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
                        Reintentar
                    </Button>
                </div>
            ) : aptitud ? (
                <div className="mt-4">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-secondary/50"
                        onClick={() => setExpanded((v) => !v)}
                        aria-expanded={expanded}
                    >
                        <span>
                            {aptitud.bloqueos.length === 0
                                ? "Todos los criterios obligatorios están cumplidos."
                                : `${aptitud.bloqueos.length} bloqueo(s)${aptitud.advertencias.length ? `, ${aptitud.advertencias.length} advertencia(s)` : ""}.`}
                        </span>
                        {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                    </button>

                    {expanded && (
                        <ul className="mt-3 space-y-2">
                            {aptitud.criterios.map((criterio) => {
                                const blocked = !criterio.cumple;
                                return (
                                    <li
                                        key={criterio.clave}
                                        ref={(el) => {
                                            criterionRefs.current[criterio.clave] = el;
                                        }}
                                        tabIndex={-1}
                                        className={`rounded-xl border px-3 py-2 ${
                                            blocked
                                                ? "border-red-200 bg-red-50/50"
                                                : "border-border bg-background"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">{criterioIcon(criterio.cumple, criterio.detalle)}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-medium text-foreground">{criterio.etiqueta}</p>
                                                    <span className={`text-[11px] ${blocked ? "text-red-700" : "text-green-700"}`}>
                                                        {criterioEstadoLabel(criterio)}
                                                    </span>
                                                    {!criterio.omitible && blocked && (
                                                        <span className="text-[11px] font-medium text-red-700">No se puede omitir</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{criterio.detalle}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {aptitud.excepcionVigente && (
                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Excepción vigente registrada el {new Date(aptitud.excepcionVigente.fechaExcepcion).toLocaleDateString("es-ES")}.
                        </p>
                    )}
                </div>
            ) : null}

            {aptitud && (
                <AdoptionExceptionDialog
                    idAnimal={idAnimal}
                    open={exceptionOpen}
                    onOpenChange={setExceptionOpen}
                    criteriosOmitibles={aptitud.criterios.filter((c) => c.omitible)}
                    onSaved={() => {
                        void load();
                        onChanged?.();
                    }}
                />
            )}
        </section>
    );
}
