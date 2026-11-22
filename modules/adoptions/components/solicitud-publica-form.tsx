"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitPublicApplicationAction } from "../actions/adoption.actions";

type Props = { idAnimal: number; animalNombre: string; refugioNombre: string };

export function SolicitudPublicaForm({ idAnimal, animalNombre, refugioNombre }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);

    if (result) {
        return (
            <Card>
                <CardHeader><CardTitle>Solicitud recibida</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p className="text-foreground">Tu solicitud para adoptar a <strong>{animalNombre}</strong> fue recibida.</p>
                    <p><span className="text-muted-foreground">Folio:</span> <span className="font-mono font-medium text-foreground">{String(result.codigo_seguimiento ?? "")}</span></p>
                    <p><span className="text-muted-foreground">Estado:</span> {String(result.estado_solicitud ?? "Recibida")}</p>
                    <p className="text-muted-foreground">{String(result.mensaje ?? "El refugio se pondrá en contacto contigo.")}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Link href="/adopciones/seguimiento" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-medium hover:bg-secondary">Consultar seguimiento</Link>
                        <Link href="/adopciones" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Volver al catálogo</Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader><CardTitle>Datos del postulante</CardTitle></CardHeader>
            <CardContent>
                {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setError(null);
                        const fd = new FormData(e.currentTarget);
                        const body = {
                            nombre_completo: String(fd.get("nombre_completo") ?? ""),
                            telefono: String(fd.get("telefono") ?? ""),
                            correo: String(fd.get("correo") ?? ""),
                            direccion: String(fd.get("direccion") ?? ""),
                            tiene_otras_mascotas: fd.get("tiene_otras_mascotas") === "on",
                            tiene_ninos: fd.get("tiene_ninos") === "on",
                            espacio_techado: fd.get("espacio_techado") === "on",
                            tiempo_solo_horas: fd.get("tiempo_solo_horas") ? Number(fd.get("tiempo_solo_horas")) : null,
                            experiencia_mascotas: String(fd.get("experiencia_mascotas") ?? "") || null,
                            motivo_adopcion: String(fd.get("motivo_adopcion") ?? ""),
                            comentarios_generales: String(fd.get("comentarios_generales") ?? "") || null,
                            acepta_politica_privacidad: fd.get("acepta_politica_privacidad") === "on",
                            declara_mayor_edad: fd.get("declara_mayor_edad") === "on",
                            sitio_web: String(fd.get("sitio_web") ?? ""),
                        };
                        startTransition(async () => {
                            const res = await submitPublicApplicationAction(idAnimal, body);
                            if (res.success) setResult(res.data as Record<string, unknown>);
                            else setError(res.error);
                        });
                    }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1 text-sm"><span>Nombre completo *</span><Input name="nombre_completo" required minLength={2} maxLength={150} /></label>
                        <label className="space-y-1 text-sm"><span>Teléfono *</span><Input name="telefono" required minLength={7} maxLength={20} /></label>
                        <label className="space-y-1 text-sm"><span>Correo *</span><Input name="correo" type="email" required maxLength={150} /></label>
                        <label className="space-y-1 text-sm"><span>Tiempo solo (horas)</span><Input name="tiempo_solo_horas" type="number" min={0} max={24} /></label>
                    </div>
                    <label className="space-y-1 text-sm block"><span>Dirección *</span><Input name="direccion" required minLength={5} maxLength={255} /></label>
                    <div className="grid gap-3 sm:grid-cols-3 text-sm">
                        <label className="flex items-center gap-2"><input type="checkbox" name="tiene_otras_mascotas" /> Tengo otras mascotas</label>
                        <label className="flex items-center gap-2"><input type="checkbox" name="tiene_ninos" /> Hay niños en casa</label>
                        <label className="flex items-center gap-2"><input type="checkbox" name="espacio_techado" /> Tengo espacio techado</label>
                    </div>
                    <label className="space-y-1 text-sm block"><span>Experiencia con mascotas</span><Textarea name="experiencia_mascotas" maxLength={1000} /></label>
                    <label className="space-y-1 text-sm block"><span>Motivo de adopción *</span><Textarea name="motivo_adopcion" required minLength={20} maxLength={1000} /></label>
                    <label className="space-y-1 text-sm block"><span>Comentarios generales</span><Textarea name="comentarios_generales" maxLength={2000} /></label>

                    <div className="hidden" aria-hidden="true">
                        <label>Sitio web<input name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
                    </div>

                    <div className="space-y-2 text-sm">
                        <label className="flex items-start gap-2"><input type="checkbox" name="acepta_politica_privacidad" required className="mt-1" /> <span>Acepto la <Link href="/aviso-privacidad" className="text-primary hover:underline">política de privacidad</Link> y el tratamiento de mis datos para esta solicitud. *</span></label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="declara_mayor_edad" required className="mt-1" /> <span>Declaro que soy mayor de edad. *</span></label>
                    </div>

                    <p className="text-xs text-muted-foreground">Refugio receptor: {refugioNombre}. El refugio te contactará; no se garantiza la adopción.</p>

                    <Button type="submit" className="w-full min-h-12" disabled={isPending}>
                        {isPending ? "Enviando solicitud..." : "Enviar solicitud"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}