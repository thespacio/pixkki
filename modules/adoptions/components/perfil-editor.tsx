"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/components/ui/utils";
import { upsertPerfilAdopcionAction } from "../actions/adoption.actions";
import {
    CODIGO_DESCRIPCION_INVALIDA,
    DESCRIPCION_MAXIMA,
    DESCRIPCION_MINIMA,
} from "../services/profile-eligibility";

type Props = {
    idAnimal: number;
    nombre: string;
    descripcion: string | null;
    publicado: boolean;
    bloqueos?: string[];
    /** Códigos canónicos alineados con `bloqueos` (permite ocultar el bloqueo ya corregido). */
    codigosBloqueo?: string[];
    triggerLabel?: string;
    autoOpen?: boolean;
};

type ErrorUI = { mensaje: string; bloqueos: string[] };

const DetalleBloqueosSchema = z.object({
    bloqueos: z.array(z.string()).optional(),
});

function leerBloqueos(details: unknown): string[] {
    const parsed = DetalleBloqueosSchema.safeParse(details);
    return parsed.success ? (parsed.data.bloqueos ?? []) : [];
}

export function PerfilEditor({
    idAnimal,
    nombre,
    descripcion,
    publicado,
    bloqueos = [],
    codigosBloqueo = [],
    triggerLabel,
    autoOpen = false,
}: Props) {
    const router = useRouter();
    const uid = useId();
    const [open, setOpen] = useState(autoOpen);
    const [isPending, startTransition] = useTransition();
    const [texto, setTexto] = useState(descripcion ?? "");
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<ErrorUI | null>(null);

    const longitud = texto.trim().length;
    const longitudValida = longitud >= DESCRIPCION_MINIMA && longitud <= DESCRIPCION_MAXIMA;
    const bloqueosVisibles = bloqueos.filter(
        (_bloqueo, indice) => codigosBloqueo[indice] !== CODIGO_DESCRIPCION_INVALIDA,
    );
    const puedePublicarAhora = !publicado && longitudValida && bloqueosVisibles.length === 0;

    function changeOpen(next: boolean) {
        if (!next) {
            setError(null);
            setMsg(null);
        }
        setOpen(next);
    }

    function submit(nextPublicado: boolean) {
        setMsg(null);
        setError(null);
        const normalizado = texto.trim();

        if (normalizado.length > DESCRIPCION_MAXIMA) {
            setError({
                mensaje: `La descripción no puede superar los ${DESCRIPCION_MAXIMA} caracteres.`,
                bloqueos: [],
            });
            return;
        }
        if (nextPublicado && !longitudValida) {
            setError({
                mensaje: `La descripción debe tener entre ${DESCRIPCION_MINIMA} y ${DESCRIPCION_MAXIMA} caracteres.`,
                bloqueos: [],
            });
            return;
        }

        startTransition(async () => {
            const res = await upsertPerfilAdopcionAction(idAnimal, {
                descripcion_publica: normalizado === "" ? null : normalizado,
                publicado: nextPublicado,
            });
            if (res.success) {
                setMsg(nextPublicado ? "Perfil publicado en el catálogo." : (publicado ? "Perfil despublicado." : "Borrador guardado."));
                router.refresh();
            } else {
                setError({ mensaje: res.error, bloqueos: leerBloqueos(res.details) });
            }
        });
    }

    const etiqueta = triggerLabel ?? (
        publicado ? "Editar / despublicar" : (puedePublicarAhora ? "Editar y publicar" : "Editar borrador")
    );

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={isPending}>{etiqueta}</Button>
            </DialogTrigger>
            <DialogContent
                className="inset-x-0 bottom-0 top-auto h-[95dvh] max-h-[95dvh] max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:right-auto sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-6"
            >
                <DialogHeader className="pr-8">
                    <DialogTitle>Perfil de adopción: {nombre}</DialogTitle>
                    <DialogDescription>
                        Guarda el borrador, publica el perfil o despublícalo. Publicar exige
                        descripción de {DESCRIPCION_MINIMA} a {DESCRIPCION_MAXIMA} caracteres,
                        al menos una foto y que el animal esté apto.
                    </DialogDescription>
                </DialogHeader>

                {msg && (
                    <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {msg}
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
                {bloqueosVisibles.length > 0 && (
                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <p className="font-medium">Bloqueos para publicar:</p>
                        <ul className="list-disc pl-5">
                            {bloqueosVisibles.map((bloqueo, indice) => (
                                <li key={`${bloqueo}-${indice}`}>{bloqueo}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor={`${uid}-descripcion`}>
                            Descripción pública
                        </label>
                        <Textarea
                            id={`${uid}-descripcion`}
                            value={texto}
                            onChange={(event) => setTexto(event.target.value)}
                            aria-describedby={`${uid}-contador`}
                            className="field-sizing-fixed min-h-0 max-h-56 overflow-y-auto"
                            rows={8}
                            maxLength={DESCRIPCION_MAXIMA}
                            placeholder="Describe al animal para potenciales adoptantes."
                        />
                        <p
                            id={`${uid}-contador`}
                            aria-live="polite"
                            className={cn(
                                "text-xs",
                                longitud > 0 && !longitudValida ? "text-amber-700" : "text-muted-foreground",
                            )}
                        >
                            {longitud} / {DESCRIPCION_MAXIMA} caracteres
                            {longitud < DESCRIPCION_MINIMA && ` · Mínimo ${DESCRIPCION_MINIMA} para publicar`}
                        </p>
                    </div>

                    <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                        {!publicado && (
                            <Button type="button" disabled={isPending || !puedePublicarAhora} onClick={() => submit(true)}>
                                {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                                Publicar
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => submit(false)}
                        >
                            {publicado ? "Despublicar" : "Guardar borrador"}
                        </Button>
                        <Button type="button" variant="ghost" disabled={isPending} onClick={() => changeOpen(false)}>
                            Cancelar
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Estado actual: {publicado ? "Publicado" : "Borrador / no publicado"}
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}
