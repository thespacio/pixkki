import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PublicCatalogItemDTO } from "../dtos/public-catalog.dto";
import { formatAtributos, formatEdad, formatSexo, formatUbicacion } from "./catalog-format";

/** Alias conservado para consumidores existentes del catálogo. */
export type CatalogItem = PublicCatalogItemDTO;

export function PublicAnimalCard({ item }: { item: PublicCatalogItemDTO }) {
    const atributos = formatAtributos(item);
    const ubicacion = formatUbicacion(item.refugio);
    const sexo = formatSexo(item.sexo);
    const edad = formatEdad(item.edad_estimada);

    return (
        <Card className="flex h-full flex-col overflow-hidden border-border/80 transition-shadow hover:shadow-md">
            <div className="aspect-[4/3] bg-secondary">
                {item.foto_principal ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL pública de la vista, sin optimizador
                    <img
                        src={item.foto_principal}
                        alt={`Foto de ${item.nombre}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        Sin fotografía
                    </div>
                )}
            </div>
            <CardContent className="flex flex-1 flex-col space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="break-words font-semibold text-foreground">{item.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                            {[item.especie, item.raza].filter(Boolean).join(" · ") || "Mascota"}
                        </p>
                    </div>
                    {sexo && <Badge variant="secondary" className="shrink-0">{sexo}</Badge>}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {edad && <span>{edad}</span>}
                    {item.tamano && <span>{item.tamano}</span>}
                    {item.color && <span>{item.color}</span>}
                </div>

                {atributos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {atributos.map((atributo) => (
                            <Badge key={atributo} variant="outline" className="text-xs">{atributo}</Badge>
                        ))}
                    </div>
                )}

                <p className="mt-auto break-words text-xs text-muted-foreground">
                    {item.refugio?.nombre ?? "Refugio"}
                    {ubicacion ? ` · ${ubicacion}` : ""}
                </p>

                <Link
                    href={`/adopciones/${item.id_animal}`}
                    aria-label={`Ver perfil de ${item.nombre}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    Ver perfil
                </Link>
            </CardContent>
        </Card>
    );
}
