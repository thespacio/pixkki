"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    changeSolicitudEstadoAction,
    createEvaluacionAction,
    completarAdopcionAction,
} from "../actions/adoption.actions";
import { ADOPTION_PERMISSIONS } from "../access";

type Props = {
    idSolicitud: number;
    estado: string;
    permissions: string[];
};

const TRANSITIONS: Record<string, string[]> = {
    Recibida: ["En entrevista", "Rechazada", "Cancelada"],
    "En entrevista": ["En evaluación", "Rechazada", "Cancelada"],
    "En evaluación": ["Aprobada", "Rechazada", "Cancelada"],
    Aprobada: ["Cancelada"],
};

export function SolicitudDetailActions({ idSolicitud, estado, permissions }: Props) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canManage = permissions.includes(ADOPTION_PERMISSIONS.manage);
    const canEvaluate = permissions.includes(ADOPTION_PERMISSIONS.evaluate);
    const canComplete = permissions.includes(ADOPTION_PERMISSIONS.complete);
    const nextStates = TRANSITIONS[estado] ?? [];

    function run(action: () => Promise<{ success: boolean; error?: string }>, successMsg: string) {
        setError(null); setMessage(null);
        startTransition(async () => {
            const res = await action();
            if (res?.success) setMessage(successMsg);
            else setError(res?.error ?? "No se pudo completar la acción.");
        });
    }

    return (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-base font-semibold text-foreground">Acciones</h2>
            {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            {canEvaluate && !["Rechazada", "Cancelada", "Completada"].includes(estado) && (
                <Dialog>
                    <DialogTrigger asChild><Button variant="outline" disabled={isPending}>Registrar evaluación</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Registrar evaluación</DialogTitle></DialogHeader>
                        <form
                            className="space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                run(() => createEvaluacionAction(idSolicitud, {
                                    tipo_evaluacion: fd.get("tipo_evaluacion"),
                                    resultado: fd.get("resultado"),
                                    puntuacion: fd.get("puntuacion") ? Number(fd.get("puntuacion")) : null,
                                    comentarios: fd.get("comentarios") || null,
                                    fecha_evaluacion: fd.get("fecha_evaluacion"),
                                }), "Evaluación registrada.");
                            }}
                        >
                            <Select name="tipo_evaluacion" defaultValue="entrevista">
                                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                                <SelectContent>
                                    {["entrevista","visita_hogar","compatibilidad","referencias","otro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select name="resultado" defaultValue="Pendiente">
                                <SelectTrigger><SelectValue placeholder="Resultado" /></SelectTrigger>
                                <SelectContent>
                                    {["Pendiente","Aprobado","Rechazado","Con observaciones"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input name="puntuacion" type="number" min={0} max={100} placeholder="Puntuación (0-100)" />
                            <Input name="fecha_evaluacion" type="datetime-local" required />
                            <Textarea name="comentarios" placeholder="Comentarios" />
                            <Button type="submit" disabled={isPending}>Guardar evaluación</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {canManage && nextStates.length > 0 && (
                <Dialog>
                    <DialogTrigger asChild><Button variant="outline" disabled={isPending}>Cambiar estado</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Cambiar estado</DialogTitle></DialogHeader>
                        <form
                            className="space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                run(() => changeSolicitudEstadoAction(idSolicitud, {
                                    estado_solicitud: fd.get("estado_solicitud"),
                                    motivo: fd.get("motivo") || null,
                                }), "Estado actualizado.");
                            }}
                        >
                            <Select name="estado_solicitud" defaultValue={nextStates[0]}>
                                <SelectTrigger><SelectValue placeholder="Nuevo estado" /></SelectTrigger>
                                <SelectContent>{nextStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                            <Textarea name="motivo" placeholder="Motivo (obligatorio para rechazar/cancelar)" />
                            <Button type="submit" disabled={isPending}>Confirmar cambio</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {canComplete && estado === "Aprobada" && (
                <Dialog>
                    <DialogTrigger asChild><Button disabled={isPending}>Completar adopción</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Completar adopción</DialogTitle></DialogHeader>
                        <p className="text-sm text-muted-foreground">Esta acción marcará la adopción como completada y el animal saldrá del catálogo y de la población activa.</p>
                        <form
                            className="space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                run(() => completarAdopcionAction(idSolicitud, {
                                    fecha_adopcion: fd.get("fecha_adopcion"),
                                    observaciones: fd.get("observaciones") || null,
                                }), "Adopción completada.");
                            }}
                        >
                            <Input name="fecha_adopcion" type="date" required max={new Date().toISOString().slice(0,10)} />
                            <Textarea name="observaciones" placeholder="Observaciones (opcional)" />
                            <Button type="submit" disabled={isPending}>Confirmar adopción</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}