"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { upsertPerfilAdopcionAction } from "../actions/adoption.actions";

type Props = {
    idAnimal: number;
    nombre: string;
    descripcion: string | null;
    publicado: boolean;
    puedePublicarse?: boolean;
    bloqueos?: string[];
};

export function PerfilEditor({ idAnimal, nombre, descripcion, publicado, puedePublicarse, bloqueos = [] }: Props) {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    function submit(nextPublicado: boolean, form: HTMLFormElement) {
        setMsg(null); setErr(null);
        const fd = new FormData(form);
        startTransition(async () => {
            const res = await upsertPerfilAdopcionAction(idAnimal, {
                descripcion_publica: String(fd.get("descripcion_publica") ?? ""),
                publicado: nextPublicado,
            });
            if (res.success) setMsg(nextPublicado ? "Perfil publicado." : "Borrador guardado.");
            else setErr(res.error);
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline">Editar perfil</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Perfil de adopción: {nombre}</DialogTitle></DialogHeader>
                {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}
                {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
                {bloqueos.length > 0 && (
                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <p className="font-medium">Bloqueos para publicar:</p>
                        <ul className="list-disc pl-5">{bloqueos.map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                )}
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor={`desc-${idAnimal}`}>Descripción pública</label>
                        <Textarea id={`desc-${idAnimal}`} name="descripcion_publica" defaultValue={descripcion ?? ""} rows={8} maxLength={2000} placeholder="Describe al animal para potenciales adoptantes (50-2000 caracteres al publicar)." />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={isPending} onClick={(e) => submit(false, e.currentTarget.form!)}>Guardar borrador</Button>
                        <Button type="button" disabled={isPending || puedePublicarse === false} onClick={(e) => submit(true, e.currentTarget.form!)}>Publicar</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Estado actual: {publicado ? "Publicado" : "Borrador/No publicado"}</p>
                </form>
            </DialogContent>
        </Dialog>
    );
}