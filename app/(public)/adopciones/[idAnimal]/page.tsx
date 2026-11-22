import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdoptionDomainError } from "@/modules/adoptions/errors";

type Props = { params: { idAnimal: string } };

export default async function PublicAnimalPage({ params }: Props) {
    const idAnimal = Number(params.idAnimal);
    if (!Number.isInteger(idAnimal) || idAnimal <= 0) notFound();

    let animal: Record<string, unknown>;
    try {
        const service = await createPublicCatalogService();
        animal = await service.getAnimal(idAnimal) as Record<string, unknown>;
    } catch (error) {
        if (isAdoptionDomainError(error) && error.statusCode === 404) notFound();
        throw error;
    }

    const fotos = (Array.isArray(animal.fotos) ? animal.fotos : []) as Array<Record<string, unknown>>;
    const mainPhoto = fotos.find((f) => f.es_principal) ?? fotos[0];
    const refugio = (animal.refugio ?? {}) as Record<string, unknown>;
    const compat = (animal.compatibilidad ?? {}) as Record<string, unknown>;

    return (
        <PublicShell>
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-sm text-muted-foreground">
                    <Link href="/adopciones" className="hover:underline">Adopciones</Link> / {String(animal.nombre ?? "")}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                            {mainPhoto?.url_archivo ? (
                                <img src={String(mainPhoto.url_archivo)} alt={`Foto de ${String(animal.nombre)}`} className="aspect-[4/3] w-full object-cover" />
                            ) : (
                                <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground">Sin fotografía</div>
                            )}
                        </div>
                        {fotos.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {fotos.slice(0, 8).map((f) => (
                                    <img key={String(f.id_fotografia)} src={String(f.url_thumbnail || f.url_archivo || "")} alt={`Miniatura de ${String(animal.nombre)}`} className="aspect-square w-full rounded-lg object-cover border border-border" loading="lazy" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{String(animal.nombre ?? "")}</h1>
                            <p className="text-muted-foreground">{[animal.especie, animal.raza].filter(Boolean).map(String).join(" · ")}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {animal.sexo ? <Badge variant="secondary">{animal.sexo === "M" ? "Macho" : "Hembra"}</Badge> : null}
                            {animal.edad_estimada != null ? <Badge variant="secondary">{String(animal.edad_estimada)} año(s)</Badge> : null}
                            {animal.tamano ? <Badge variant="secondary">{String(animal.tamano)}</Badge> : null}
                            {animal.vacunado ? <Badge variant="outline">Vacunado</Badge> : null}
                            {animal.esterilizado ? <Badge variant="outline">Esterilizado</Badge> : null}
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Sobre {String(animal.nombre ?? "")}</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p className="whitespace-pre-line text-foreground">{String(animal.descripcion_publica ?? "Sin descripción disponible.")}</p>
                                {animal.rasgos_fisicos ? <p><span className="text-muted-foreground">Rasgos físicos:</span> {String(animal.rasgos_fisicos)}</p> : null}
                                {animal.temperamento ? <p><span className="text-muted-foreground">Temperamento:</span> {String(animal.temperamento)}</p> : null}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Compatibilidad</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Apto con perros:</span> {String(compat.apto_perros ?? "Sin información")}</p>
                                <p><span className="text-muted-foreground">Apto con gatos:</span> {String(compat.apto_gatos ?? "Sin información")}</p>
                                <p><span className="text-muted-foreground">Apto con niños:</span> {String(compat.apto_ninos ?? "Sin información")}</p>
                                <p className="text-xs text-muted-foreground">La compatibilidad es orientativa y no sustituye la evaluación del refugio.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Refugio</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="font-medium text-foreground">{String(refugio.nombre ?? "Refugio")}</p>
                                <p className="text-muted-foreground">{[refugio.ciudad, refugio.estado].filter(Boolean).map(String).join(", ")}</p>
                                {refugio.correo_contacto ? <p className="text-muted-foreground">{String(refugio.correo_contacto)}</p> : null}
                                {refugio.telefono ? <p className="text-muted-foreground">{String(refugio.telefono)}</p> : null}
                                {refugio.slug ? <Link href={`/refugios/${String(refugio.slug)}`} className="text-primary hover:underline">Ver página del refugio</Link> : null}
                            </CardContent>
                        </Card>

                        <div className="sticky bottom-4 rounded-2xl border border-border bg-background/95 p-4 backdrop-blur">
                            <Link
                                href={`/adopciones/${String(animal.id_animal)}/solicitud`}
                                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                            >
                                Quiero adoptar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}