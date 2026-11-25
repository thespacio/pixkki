"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publicarAnimalEnAdopcionesAction } from "../actions/adoption.actions";
import { DESCRIPCION_MAXIMA, DESCRIPCION_MINIMA } from "../services/profile-eligibility";

type Props = {
    idAnimal: number;
    nombre: string;
    descripcion?: string | null;
    triggerLabel?: string;
    variant?: "default" | "outline" | "secondary";
    size?: "default" | "sm";
    /** Solo en el expediente: permite abrir el gatekeeper por excepción. */
    permitirExcepcion?: boolean;
    /** Abre el diálogo al montar (deep-link desde una acción previa). */
    autoOpen?: boolean;
    onChanged?: () => void;
};

type ErrorUI = { mensaje: string; bloqueos: string[] };

function leerBloqueos(details: unknown): string[] {
    if (typeof details !== "object" || details === null || !("bloqueos" in details)) return [];
    const bloqueos = (details as { bloqueos?: unknown }).bloqueos;
    return Array.isArray(bloqueos)
        ? bloqueos.filter((b): b is string => typeof b === "string")
        : [];
}

/**
 * Diálogo único para «habilitar + publicar» un animal en el portal de
 * adopciones. Se usa tanto en la ficha clínica como en /adopciones/perfiles.
 */
export function PublicarAdopcionDialog({
    idAnimal,
    nombre,
    descripcion,
    triggerLabel = "Habilitar y publicar",
    variant = "default",
    size = "default",
    permitirExcepcion = false,
    autoOpen = false,
    onChanged,
}: Props) {
    const router = useRouter();
    const uid = useId();
    const [open, setOpen] = useState(autoOpen);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<ErrorUI | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    function changeOpen(next: boolean) {
        if (!next) {
            setError(null);
            setOk(null);
        }
        setOpen(next);
    }

    function submit(form: HTMLFormElement) {
        setError(null);
        setOk(null);
        const datos = new FormData(form);
        const descripcionPublica = String(datos.get("descripcion_publica") ?? "").trim();
        const autorizarExcepcion = datos.get("autorizar_excepcion") === "on";
        const motivo = String(datos.get("motivo_excepcion") ?? "").trim();

        if (
            descripcionPublica.length < DESCRIPCION_MINIMA ||
            descripcionPublica.length > DESCRIPCION_MAXIMA
        ) {
            setError({
                mensaje: `La descripción debe tener entre ${DESCRIPCION_MINIMA} y ${DESCRIPCION_MAXIMA} caracteres.`,
                bloqueos: [],
            });
            return;
        }
        if (autorizarExcepcion && (motivo.length < 20 || motivo.length > 1000)) {
            setError({ mensaje: "El motivo de la excepción debe tener entre 20 y 1000 caracteres.", bloqueos: [] });
            return;
        }

        startTransition(async () => {
            const res = await publicarAnimalEnAdopcionesAction(idAnimal, {
                descripcion_publica: descripcionPublica,
                autorizar_excepcion: autorizarExcepcion,
                motivo_excepcion: autorizarExcepcion ? motivo : null,
            });
            if (res.success) {
                setOk(`${nombre} ya está habilitado y publicado en el catálogo de adopciones.`);
                changeOpen(false);
                onChanged?.();
                router.refresh();
            } else {
                setError({ mensaje: res.error, bloqueos: leerBloqueos(res.details) });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant={variant} size={size} disabled={isPending}>
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Publicar a {nombre} en adopciones</DialogTitle>
                    <DialogDescription>
                        Se habilita la aptitud del paciente y se publica su perfil público.
                        El animal aparecerá en el catálogo solo si cumple todos los requisitos.
                    </DialogDescription>
                </DialogHeader>

                {ok && (
                    <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {ok}
                    </p>
                )}
                {error && (
                    <div role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        <p>{error.mensaje}</p>
                        {error.bloqueos.length > 0 && (
                            <ul className="mt-1 list-disc pl-5">
                                {error.bloqueos.map((bloqueo, indice) => (
                                    <li key={`${bloqueo}-${indice}`}>{bloqueo}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit(event.currentTarget);
                    }}
                >
                    <div className="space-y-2">
                        <Label htmlFor={`${uid}-descripcion`}>Descripción pública</Label>
                        <Textarea
                            id={`${uid}-descripcion`}
                            name="descripcion_publica"
                            defaultValue={descripcion ?? ""}
                            className="field-sizing-fixed min-h-0 max-h-56 overflow-y-auto"
                            rows={8}
                            minLength={DESCRIPCION_MINIMA}
                            maxLength={DESCRIPCION_MAXIMA}
                            placeholder="Describe al animal para potenciales adoptantes."
                        />
                        <p className="text-xs text-muted-foreground">
                            Entre {DESCRIPCION_MINIMA} y {DESCRIPCION_MAXIMA} caracteres.
                        </p>
                    </div>

                    {permitirExcepcion && (
                        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    id={`${uid}-excepcion`}
                                    type="checkbox"
                                    name="autorizar_excepcion"
                                    className="size-4 accent-amber-600"
                                />
                                <Label htmlFor={`${uid}-excepcion`}>Autorizar excepción de aptitud</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${uid}-motivo`}>Motivo de la excepción</Label>
                                <Textarea
                                    id={`${uid}-motivo`}
                                    name="motivo_excepcion"
                                    className="field-sizing-fixed min-h-0 max-h-32 overflow-y-auto"
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Explica qué criterio se omite y por qué."
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => changeOpen(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                            Habilitar y publicar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
