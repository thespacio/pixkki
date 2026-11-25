"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";
import type { PublicAnimalDetailDTO } from "../dtos/public-catalog.dto";

type FotoGaleria = NonNullable<PublicAnimalDetailDTO["fotos"]>[number];

type PublicAnimalGalleryProps = {
    fotos: FotoGaleria[];
    nombre: string;
};

/**
 * Galería pública del perfil. Solo gestiona la foto seleccionada: la fuente de
 * datos sigue siendo el DTO validado y no contiene lógica de negocio.
 */
export function PublicAnimalGallery({ fotos, nombre }: PublicAnimalGalleryProps) {
    const [fotoSeleccionada, setFotoSeleccionada] = useState(0);
    const fotosVisibles = fotos.filter((foto) => foto.url_archivo || foto.url_thumbnail);
    const indice = Math.min(fotoSeleccionada, Math.max(fotosVisibles.length - 1, 0));
    const fotoActual = fotosVisibles[indice];
    const urlPrincipal = fotoActual?.url_archivo ?? null;

    return (
        <section aria-label={`Fotos de ${nombre}`} className="min-w-0 space-y-3">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-secondary">
                {urlPrincipal ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL pública de la vista, sin optimizador
                    <img
                        src={urlPrincipal}
                        alt={fotoActual?.es_principal ? `Foto de ${nombre}` : `Foto ${indice + 1} de ${nombre}`}
                        className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
                    />
                ) : (
                    <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm text-muted-foreground sm:aspect-[16/10]">
                        Sin fotografía
                    </div>
                )}
            </div>

            {fotosVisibles.length > 1 && (
                <div role="group" aria-label={`Miniaturas de ${nombre}`} className="min-w-0">
                    <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                        {fotosVisibles.map((foto, indiceFoto) => {
                            const url = foto.url_thumbnail || foto.url_archivo;
                            if (!url) return null;
                            const activa = indiceFoto === indice;

                            return (
                                <button
                                    key={foto.id_fotografia ?? `${url}-${indiceFoto}`}
                                    type="button"
                                    onClick={() => setFotoSeleccionada(indiceFoto)}
                                    aria-label={`Ver foto ${indiceFoto + 1} de ${nombre}`}
                                    aria-pressed={activa}
                                    className={cn(
                                        "relative aspect-square w-16 shrink-0 snap-start overflow-hidden rounded-lg border transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-20",
                                        activa
                                            ? "border-primary ring-2 ring-primary/60"
                                            : "border-border opacity-70 hover:opacity-100",
                                    )}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element -- Miniatura pública, sin optimizador */}
                                    <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
