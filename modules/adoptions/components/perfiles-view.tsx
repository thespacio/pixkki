import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PartialState } from "@/components/ui/partial-state";
import type {
    EstadoPerfilVisibleDTO,
    PerfilesListDTO,
    PerfilesQueryDTO,
} from "../dtos/public-profile.dto";
import { AgregarFotoDialog } from "./agregar-foto-dialog";
import { CatalogPagination } from "./catalog-pagination";
import { PerfilEditor } from "./perfil-editor";
import { PerfilesFilters } from "./perfiles-filters";
import { PublicarAdopcionDialog } from "./publicar-adopcion-dialog";

type Props = {
    data: PerfilesListDTO;
    filtros: PerfilesQueryDTO;
    puedePublicar: boolean;
    puedeHabilitar: boolean;
    puedeEditarAnimales: boolean;
};

const ETIQUETAS_ESTADO: Record<EstadoPerfilVisibleDTO, string> = {
    publicado: "Publicado",
    borrador: "Borrador",
    "no-publicable": "No publicable",
    "sin-foto": "Sin foto",
    "sin-descripcion": "Sin descripción",
};

const ESTILOS_ESTADO: Record<EstadoPerfilVisibleDTO, string> = {
    publicado: "border-emerald-200 bg-emerald-50 text-emerald-800",
    borrador: "border-border bg-secondary text-foreground",
    "no-publicable": "border-amber-200 bg-amber-50 text-amber-800",
    "sin-foto": "border-amber-200 bg-amber-50 text-amber-800",
    "sin-descripcion": "border-amber-200 bg-amber-50 text-amber-800",
};

/** Bloqueos que solo se resuelven con el flujo «habilitar + publicar». */
const CODIGOS_HABILITACION = new Set([
    "no_disponible_adopcion",
    "en_cuarentena",
    "no_activo",
    "reservado_adopcion",
]);

function formatearFecha(valor: string | null): string {
    if (!valor) return "sin registro";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "fecha no disponible";
    return fecha.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function buildHref(filtros: PerfilesQueryDTO, page?: number): string {
    const params = new URLSearchParams();
    if (filtros.q) params.set("q", filtros.q);
    if (filtros.especie) params.set("especie", filtros.especie);
    if (filtros.estado !== "todos") params.set("estado", filtros.estado);
    if (filtros.animal) params.set("animal", filtros.animal);
    if (page !== undefined && page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/adopciones/perfiles?${query}` : "/adopciones/perfiles";
}

/**
 * Vista de gestión de perfiles. Es un Server Component: recibe el resultado
 * tipado del servicio y solo decide presentación y acciones disponibles.
 */
export function PerfilesView({
    data,
    filtros,
    puedePublicar,
    puedeHabilitar,
    puedeEditarAnimales,
}: Props) {
    const hayFiltros =
        filtros.q !== "" || filtros.especie !== "" || filtros.estado !== "todos";
    const enlaceReintento = buildHref(filtros, data.page);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Perfiles de adopción"
                description="Gestiona la descripción pública y el estado de publicación de cada animal. Publicar exige aptitud, descripción y fotografía."
                breadcrumb={
                    <Link href="/adopciones" className="hover:underline">
                        Adopciones / Perfiles
                    </Link>
                }
                actions={
                    <nav aria-label="Secciones de adopciones" className="flex flex-wrap gap-2">
                        <Link
                            href="/adopciones/solicitudes"
                            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary"
                        >
                            Solicitudes
                        </Link>
                        <Link
                            href="/adopciones/perfiles"
                            aria-current="page"
                            className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                        >
                            Perfiles
                        </Link>
                    </nav>
                }
            />

            {!puedeHabilitar && puedePublicar && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Puedes editar y publicar perfiles de animales ya aptos. Para habilitar un
                    animal nuevo necesitas el permiso <code>animals.edit</code>.
                </p>
            )}

            <DataToolbar
                search={
                    <PerfilesFilters
                        key={`${filtros.q}|${filtros.especie}|${filtros.estado}`}
                    />
                }
                count={{ shown: data.items.length, total: data.total }}
            />

            {data.fallidos > 0 && (
                <PartialState
                    title="Algunos perfiles no pudieron cargarse"
                    description={`No pudimos consultar ${data.fallidos} ${data.fallidos === 1 ? "perfil" : "perfiles"}. El resto del listado sigue disponible.`}
                    action={
                        <Link
                            href={enlaceReintento}
                            className="inline-flex min-h-11 items-center rounded-xl border border-current px-4 text-sm font-medium"
                        >
                            Reintentar
                        </Link>
                    }
                />
            )}

            {data.limiteAplicado && (
                <PartialState
                    title="Listado parcial"
                    description={`Mostramos los primeros ${data.candidatos} candidatos. Ajusta la búsqueda para encontrar otros animales.`}
                />
            )}

            {data.items.length === 0 ? (
                <EmptyState
                    icon={PawPrint}
                    title="No hay perfiles para mostrar"
                    description={
                        hayFiltros
                            ? "No hay animales que cumplan los filtros actuales. Prueba con otro estado o especie."
                            : "Todavía no hay animales disponibles para gestionar perfiles."
                    }
                    action={
                        <Link
                            href={hayFiltros ? "/adopciones/perfiles" : "/animales"}
                            className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                        >
                            {hayFiltros ? "Limpiar filtros" : "Ver animales"}
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {data.items.map((fila) => {
                        const nombre = fila.animal.nombre ?? `Animal #${fila.animal.idAnimal}`;
                        const publicado = fila.perfil?.publicado ?? false;
                        const codigos = fila.perfil?.codigos ?? [];
                        const requiereHabilitacion =
                            !publicado && codigos.some((codigo) => CODIGOS_HABILITACION.has(codigo));
                        const destacado = filtros.animal === String(fila.animal.idAnimal);
                        const portada =
                            fila.perfil?.fotos.find((foto) => foto.es_principal) ??
                            fila.perfil?.fotos[0] ??
                            null;
                        const urlFoto = portada ? (portada.url_thumbnail ?? portada.url_archivo) : null;

                        return (
                            <Card key={fila.animal.idAnimal} className="overflow-hidden">
                                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-20">
                                            {urlFoto ? (
                                                // eslint-disable-next-line @next/next/no-img-element -- URL pública de Supabase, sin optimizador
                                                <img
                                                    src={urlFoto}
                                                    alt={`Foto de ${nombre}`}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center px-1 text-center text-[11px] text-muted-foreground">
                                                    Sin foto
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="break-words text-base font-semibold text-foreground">
                                                    {nombre}
                                                </h2>
                                                {fila.estados.map((estado) => (
                                                    <Badge
                                                        key={estado}
                                                        variant="outline"
                                                        className={ESTILOS_ESTADO[estado]}
                                                    >
                                                        {ETIQUETAS_ESTADO[estado]}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {[fila.animal.especie, fila.animal.raza]
                                                    .filter((valor): valor is string => Boolean(valor))
                                                    .join(" · ") || "Animal"}
                                            </p>

                                            {fila.motivo && !publicado && (
                                                <p className="break-words text-xs text-amber-700">
                                                    Motivo: {fila.motivo}
                                                </p>
                                            )}
                                            {fila.error && (
                                                <p role="alert" className="text-xs text-rose-600">
                                                    {fila.error}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Última actualización:{" "}
                                                {formatearFecha(fila.perfil?.updated_at ?? null)}
                                            </p>
                                            <Link
                                                href={`/animales/${fila.animal.idAnimal}/ficha-clinica`}
                                                className="inline-flex min-h-11 items-center text-xs text-muted-foreground hover:underline"
                                            >
                                                Ver expediente
                                            </Link>
                                        </div>
                                    </div>

                                    {!fila.error &&
                                        (puedePublicar ||
                                            requiereHabilitacion ||
                                            puedeEditarAnimales) && (
                                        <div className="flex w-full flex-col gap-2 sm:w-44 sm:shrink-0">
                                            {puedeEditarAnimales &&
                                                fila.estados.includes("sin-foto") && (
                                                    <AgregarFotoDialog
                                                        idAnimal={fila.animal.idAnimal}
                                                        nombre={nombre}
                                                        canEdit={puedeEditarAnimales}
                                                    />
                                                )}
                                            {puedePublicar && !requiereHabilitacion && (
                                                <PerfilEditor
                                                    idAnimal={fila.animal.idAnimal}
                                                    nombre={nombre}
                                                    descripcion={fila.perfil?.descripcion_publica ?? null}
                                                    publicado={publicado}
                                                    bloqueos={fila.perfil?.bloqueos ?? []}
                                                    codigosBloqueo={codigos}
                                                    autoOpen={destacado}
                                                />
                                            )}
                                            {puedeHabilitar && requiereHabilitacion && (
                                                <PublicarAdopcionDialog
                                                    idAnimal={fila.animal.idAnimal}
                                                    nombre={nombre}
                                                    descripcion={fila.perfil?.descripcion_publica}
                                                    triggerLabel="Habilitar y publicar"
                                                    variant="outline"
                                                    autoOpen={destacado}
                                                />
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <CatalogPagination
                basePath="/adopciones/perfiles"
                params={{
                    q: filtros.q || undefined,
                    especie: filtros.especie || undefined,
                    estado: filtros.estado === "todos" ? undefined : filtros.estado,
                    animal: filtros.animal || undefined,
                }}
                page={data.page}
                totalPages={data.totalPages}
            />
        </div>
    );
}
