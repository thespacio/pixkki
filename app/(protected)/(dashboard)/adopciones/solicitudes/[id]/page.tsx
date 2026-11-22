import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { ADOPTION_PERMISSIONS } from "@/modules/adoptions/access";
import { createApplicationService } from "@/modules/adoptions/factories/create-application-service";
import { AdoptionStatusBadge } from "@/modules/adoptions/components/adoption-status-badge";
import { SolicitudDetailActions } from "@/modules/adoptions/components/solicitud-detail-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: { id: string } };

export default async function SolicitudDetailPage({ params }: Props) {
    const user = await getCurrentUser();
    if (!user.permissions.includes(ADOPTION_PERMISSIONS.view)) {
        return <div className="p-6"><p className="text-sm text-muted-foreground">No tienes permiso para ver esta solicitud.</p></div>;
    }

    const idSolicitud = Number(params.id);
    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) notFound();

    const service = await createApplicationService();
    let solicitud: Record<string, unknown>;
    try {
        solicitud = await service.getById(idSolicitud, user) as Record<string, unknown>;
    } catch {
        notFound();
    }

    const adoptante = (solicitud.adoptante ?? {}) as Record<string, unknown>;
    const animal = (solicitud.animal ?? {}) as Record<string, unknown>;
    const evaluaciones = (Array.isArray(solicitud.evaluacion_adopcion) ? solicitud.evaluacion_adopcion : []) as Array<Record<string, unknown>>;
    evaluaciones.sort((a, b) => String(b.fecha_evaluacion ?? "").localeCompare(String(a.fecha_evaluacion ?? "")));

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground"><Link href="/adopciones/solicitudes" className="hover:underline">Solicitudes</Link> / Detalle</p>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Solicitud #{String(solicitud.id_solicitud)}</h1>
                    <AdoptionStatusBadge status={String(solicitud.estado_solicitud ?? "")} />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Adoptante</CardTitle></CardHeader>
                        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                            <p><span className="text-muted-foreground">Nombre:</span> {String(adoptante.nombre_completo ?? "—")}</p>
                            <p><span className="text-muted-foreground">Correo:</span> {String(adoptante.correo ?? "—")}</p>
                            <p><span className="text-muted-foreground">Teléfono:</span> {String(adoptante.telefono ?? "—")}</p>
                            <p><span className="text-muted-foreground">Dirección:</span> {String(adoptante.direccion ?? "—")}</p>
                            <p><span className="text-muted-foreground">Tiene niños:</span> {adoptante.tiene_ninos ? "Sí" : "No"}</p>
                            <p><span className="text-muted-foreground">Otras mascotas:</span> {adoptante.tiene_otras_mascotas ? "Sí" : "No"}</p>
                            <p><span className="text-muted-foreground">Espacio techado:</span> {adoptante.espacio_techado ? "Sí" : "No"}</p>
                            <p><span className="text-muted-foreground">Tiempo solo (h):</span> {String(adoptante.tiempo_solo_horas ?? "—")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Animal</CardTitle></CardHeader>
                        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                            <p><span className="text-muted-foreground">Nombre:</span> {String(animal.nombre ?? "—")}</p>
                            <p><span className="text-muted-foreground">Especie:</span> {String(animal.especie ?? "—")}</p>
                            <p><span className="text-muted-foreground">Raza:</span> {String(animal.raza ?? "—")}</p>
                            <p><span className="text-muted-foreground">Edad:</span> {String(animal.edad_estimada ?? "—")}</p>
                            <p><span className="text-muted-foreground">Tamaño:</span> {String(animal.tamano ?? "—")}</p>
                            <p><span className="text-muted-foreground">Temperamento:</span> {String(animal.temperamento ?? "—")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Evaluaciones</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {evaluaciones.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aún no hay evaluaciones registradas.</p>
                            ) : evaluaciones.map((ev) => (
                                <div key={String(ev.id_evaluacion_adopcion)} className="rounded-xl border border-border p-3 text-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-medium text-foreground">{String(ev.tipo_evaluacion)} · {String(ev.resultado)}</p>
                                        <p className="text-xs text-muted-foreground">{ev.fecha_evaluacion ? new Date(String(ev.fecha_evaluacion)).toLocaleString("es-MX") : ""}</p>
                                    </div>
                                    {ev.puntuacion != null && <p className="text-muted-foreground">Puntuación: {String(ev.puntuacion)}</p>}
                                    {ev.comentarios ? <p className="mt-1 text-muted-foreground">{String(ev.comentarios)}</p> : null}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <SolicitudDetailActions
                    idSolicitud={idSolicitud}
                    estado={String(solicitud.estado_solicitud ?? "")}
                    permissions={user.permissions}
                />
            </div>
        </div>
    );
}