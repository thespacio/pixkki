import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PublicAnimalDetailDTO } from "../dtos/public-catalog.dto";
import {
    formatAtributos,
    formatDetalleCompatibilidad,
    formatEdad,
    formatSexo,
    formatSiNo,
    formatUbicacion,
} from "./catalog-format";
import { PublicAnimalGallery } from "./public-animal-gallery";

const BADGE_CLASES = "max-w-full whitespace-normal break-words";
const ENLACE_FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Dato({
    etiqueta,
    valor,
    completo = false,
}: {
    etiqueta: string;
    valor: string;
    completo?: boolean;
}) {
    return (
        <div className={completo ? "min-w-0 sm:col-span-2" : "min-w-0"}>
            <dt className="text-muted-foreground">{etiqueta}</dt>
            <dd className="min-w-0 break-words text-foreground [overflow-wrap:anywhere]">{valor}</dd>
        </div>
    );
}

/** Presentación pública del perfil de un animal. Sin lógica de negocio. */
export function PublicAnimalDetailView({ animal }: { animal: PublicAnimalDetailDTO }) {
    const fotos = animal.fotos ?? [];
    const refugio = animal.refugio;
    const ubicacion = formatUbicacion(refugio);
    const sexo = formatSexo(animal.sexo);
    const edad = formatEdad(animal.edad_estimada);
    const atributos = formatAtributos(animal);
    const compatibilidad = formatDetalleCompatibilidad(animal.compatibilidad);
    const caracteristicas = [animal.especie, animal.raza].filter(Boolean).join(" · ") || "Mascota";
    const hayBadges = Boolean(sexo || edad || animal.tamano || animal.color || atributos.length > 0);

    return (
        <>
            <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 overflow-x-clip px-4 py-6 pb-24 sm:space-y-6 sm:px-6 sm:py-8 sm:pb-28 lg:px-8">
                <nav
                    aria-label="Ruta de navegación"
                    className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
                >
                    <Link href="/adopciones" className={`shrink-0 hover:underline ${ENLACE_FOCUS}`}>
                        Adopciones
                    </Link>
                    <span aria-hidden="true" className="shrink-0">/</span>
                    <span className="min-w-0 break-words text-foreground">{animal.nombre}</span>
                </nav>

                <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-6">
                    <div className="min-w-0">
                        <PublicAnimalGallery fotos={fotos} nombre={animal.nombre} />
                    </div>

                    <div className="min-w-0 space-y-4">
                        <header className="min-w-0 space-y-2">
                            <h1 className="break-words text-2xl font-bold tracking-tight text-foreground [overflow-wrap:anywhere] sm:text-3xl">
                                {animal.nombre}
                            </h1>
                            <p className="break-words text-muted-foreground [overflow-wrap:anywhere]">{caracteristicas}</p>
                        </header>

                        {hayBadges && (
                            <div className="flex min-w-0 flex-wrap gap-2">
                                {sexo && <Badge variant="secondary" className={BADGE_CLASES}>{sexo}</Badge>}
                                {edad && <Badge variant="secondary" className={BADGE_CLASES}>{edad}</Badge>}
                                {animal.tamano && <Badge variant="secondary" className={BADGE_CLASES}>{animal.tamano}</Badge>}
                                {animal.color && <Badge variant="secondary" className={BADGE_CLASES}>{animal.color}</Badge>}
                                {atributos.map((atributo) => (
                                    <Badge key={atributo} variant="outline" className={BADGE_CLASES}>
                                        {atributo}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <Card className="min-w-0 gap-3 overflow-hidden">
                            <CardHeader className="min-w-0 px-4 pt-4 sm:px-5 sm:pt-5">
                                <h2 className="break-words text-lg font-semibold leading-none text-foreground">
                                    Sobre {animal.nombre}
                                </h2>
                            </CardHeader>
                            <CardContent className="min-w-0 space-y-3 break-words p-4 text-sm sm:p-5">
                                <p className="whitespace-pre-line break-words text-foreground [overflow-wrap:anywhere]">
                                    {animal.descripcion_publica ?? "Sin descripción disponible."}
                                </p>
                                <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                    <Dato etiqueta="Vacunado" valor={formatSiNo(animal.vacunado)} />
                                    <Dato etiqueta="Desparasitado" valor={formatSiNo(animal.desparasitado)} />
                                    <Dato etiqueta="Esterilizado" valor={formatSiNo(animal.esterilizado)} />
                                    {animal.rasgos_fisicos && (
                                        <Dato etiqueta="Rasgos físicos" valor={animal.rasgos_fisicos} completo />
                                    )}
                                    {animal.temperamento && (
                                        <Dato etiqueta="Temperamento" valor={animal.temperamento} completo />
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 gap-3 overflow-hidden">
                            <CardHeader className="min-w-0 px-4 pt-4 sm:px-5 sm:pt-5">
                                <h2 className="text-lg font-semibold leading-none text-foreground">Compatibilidad</h2>
                            </CardHeader>
                            <CardContent className="min-w-0 space-y-3 break-words p-4 text-sm sm:p-5">
                                <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                    {compatibilidad.map(({ etiqueta, valor }) => (
                                        <Dato key={etiqueta} etiqueta={etiqueta} valor={valor} />
                                    ))}
                                </dl>
                                <p className="text-xs text-muted-foreground">
                                    La compatibilidad es orientativa y no sustituye la evaluación del refugio.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="min-w-0 gap-3 overflow-hidden">
                            <CardHeader className="min-w-0 px-4 pt-4 sm:px-5 sm:pt-5">
                                <h2 className="text-lg font-semibold leading-none text-foreground">Refugio</h2>
                            </CardHeader>
                            <CardContent className="min-w-0 space-y-2 break-words p-4 text-sm sm:p-5">
                                <p className="min-w-0 break-words font-medium text-foreground [overflow-wrap:anywhere]">
                                    {refugio?.nombre ?? "Refugio"}
                                </p>
                                {ubicacion && <p className="break-words text-muted-foreground">{ubicacion}</p>}
                                {refugio?.correo_contacto && (
                                    <p className="min-w-0 break-words text-muted-foreground [overflow-wrap:anywhere]">
                                        <a
                                            href={`mailto:${refugio.correo_contacto}`}
                                            className={`hover:underline ${ENLACE_FOCUS}`}
                                        >
                                            {refugio.correo_contacto}
                                        </a>
                                    </p>
                                )}
                                {refugio?.telefono && (
                                    <p className="min-w-0 break-words text-muted-foreground [overflow-wrap:anywhere]">
                                        <a href={`tel:${refugio.telefono}`} className={`hover:underline ${ENLACE_FOCUS}`}>
                                            {refugio.telefono}
                                        </a>
                                    </p>
                                )}
                                {refugio?.slug && (
                                    <Link
                                        href={`/refugios/${refugio.slug}`}
                                        className={`inline-block break-words text-primary hover:underline ${ENLACE_FOCUS}`}
                                    >
                                        Ver página del refugio
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
                <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
                    <Link
                        href={`/adopciones/${animal.id_animal}/solicitud`}
                        className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${ENLACE_FOCUS}`}
                    >
                        Quiero adoptar
                    </Link>
                </div>
            </div>
        </>
    );
}
