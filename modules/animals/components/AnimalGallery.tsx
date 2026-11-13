"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import type { AnimalImage } from "../repositories/animal-multimedia.repository";
import { MAX_IMAGENES_POR_ANIMAL } from "../types/animales.types";

type Props = {
    idAnimal: number;
    canEdit: boolean;
};

type ApiEnvelope<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } };

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
    try {
        return (await response.json()) as ApiEnvelope<T>;
    } catch {
        return {
            success: false,
            error: { code: "RESPUESTA_INVALIDA", message: "Respuesta inválida del servidor." },
        };
    }
}

/**
 * Galería del expediente (RF1.2, US06).
 * - Lista, sube (con progreso), elimina y elige portada.
 * - La subida usa XHR porque una Server Action limita el cuerpo a 1 MB.
 */
export function AnimalGallery({ idAnimal, canEdit }: Props) {
    const [imagenes, setImagenes] = useState<AnimalImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        try {
            const response = await fetch(`/api/v1/animales/${idAnimal}/imagenes`, {
                cache: "no-store",
            });
            const result = await readEnvelope<{ imagenes: AnimalImage[] }>(response);
            if (result.success) {
                setImagenes(result.data.imagenes);
            } else {
                setError(result.error.message);
            }
        } catch {
            setError("No se pudo cargar la galería.");
        } finally {
            setLoading(false);
        }
    }, [idAnimal]);

    useEffect(() => {
        async function initialLoad() {
            await load();
        }
        void initialLoad();
    }, [load]);

    function subir(files: FileList | null) {
        if (!files || files.length === 0) return;

        setError(null);
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/v1/animales/${idAnimal}/imagenes`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                setProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";

            try {
                const result = JSON.parse(xhr.responseText) as ApiEnvelope<unknown>;
                if (xhr.status >= 200 && xhr.status < 300 && result.success) {
                    void load();
                } else {
                    setError(
                        result.success
                            ? "No se pudieron subir las imágenes."
                            : result.error.message,
                    );
                }
            } catch {
                setError("No se pudieron subir las imágenes.");
            }
        };

        xhr.onerror = () => {
            setUploading(false);
            setError("No se pudieron subir las imágenes.");
        };

        xhr.send(formData);
    }

    async function eliminar(idImagen: number) {
        if (!confirm("¿Eliminar esta imagen del expediente?")) return;

        setError(null);
        setBusyId(idImagen);
        try {
            const response = await fetch(
                `/api/v1/animales/${idAnimal}/imagenes/${idImagen}`,
                { method: "DELETE" },
            );
            const result = await readEnvelope<unknown>(response);
            if (result.success) {
                await load();
            } else {
                setError(result.error.message);
            }
        } catch {
            setError("No se pudo eliminar la imagen.");
        } finally {
            setBusyId(null);
        }
    }

    async function marcarPortada(idImagen: number) {
        setError(null);
        setBusyId(idImagen);
        try {
            const response = await fetch(
                `/api/v1/animales/${idAnimal}/imagenes/${idImagen}/portada`,
                { method: "PATCH" },
            );
            const result = await readEnvelope<unknown>(response);
            if (result.success) {
                await load();
            } else {
                setError(result.error.message);
            }
        } catch {
            setError("No se pudo designar la portada.");
        } finally {
            setBusyId(null);
        }
    }

    const lleno = imagenes.length >= MAX_IMAGENES_POR_ANIMAL;

    return (
        <section className="mt-6">
            <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-border">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    Galería
                </h4>
                <span className="text-[11px] text-muted-foreground">
                    {imagenes.length}/{MAX_IMAGENES_POR_ANIMAL}
                </span>
            </div>

            {error && (
                <p role="status" className="mb-3 text-xs text-red-600">
                    {error}
                </p>
            )}

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Cargando imágenes…
                </p>
            ) : imagenes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    El expediente aún no tiene imágenes.
                </p>
            ) : (
                <ul className="grid grid-cols-2 gap-3">
                    {imagenes.map((imagen) => (
                        <li
                            key={imagen.idImagen}
                            className="relative h-24 overflow-hidden rounded-xl border border-border bg-secondary"
                        >
                            <Image
                                src={imagen.urlThumbnail ?? imagen.urlPublica}
                                alt={imagen.nombreArchivo}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 50vw, 200px"
                                className="object-cover"
                            />

                            {imagen.esPortada && (
                                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background">
                                    <Star size={10} aria-hidden="true" /> Portada
                                </span>
                            )}

                            {canEdit && (
                                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1">
                                    {!imagen.esPortada && (
                                        <button
                                            type="button"
                                            onClick={() => marcarPortada(imagen.idImagen)}
                                            disabled={busyId !== null}
                                            aria-label="Designar como portada"
                                            className="rounded-md bg-background/90 p-1.5 text-foreground shadow-sm transition hover:bg-background disabled:opacity-50"
                                        >
                                            <Star size={13} aria-hidden="true" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => eliminar(imagen.idImagen)}
                                        disabled={busyId !== null}
                                        aria-label="Eliminar imagen"
                                        className="rounded-md bg-background/90 p-1.5 text-red-600 shadow-sm transition hover:bg-background disabled:opacity-50"
                                    >
                                        {busyId === imagen.idImagen ? (
                                            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                                        ) : (
                                            <Trash2 size={13} aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canEdit && (
                <div className="mt-3">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploading || lleno}
                        onChange={(event) => subir(event.target.files)}
                        className="hidden"
                        id={`galeria-${idAnimal}`}
                    />
                    <label
                        htmlFor={`galeria-${idAnimal}`}
                        aria-disabled={uploading || lleno}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium transition hover:bg-secondary ${
                            uploading || lleno ? "pointer-events-none opacity-50" : ""
                        }`}
                    >
                        {uploading ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        ) : (
                            <ImagePlus size={14} aria-hidden="true" />
                        )}
                        {lleno ? "Límite de 5 imágenes" : "Subir imágenes"}
                    </label>

                    {uploading && (
                        <div className="mt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Subiendo… {progress}%
                            </p>
                        </div>
                    )}

                    <p className="mt-1 text-[11px] text-muted-foreground">
                        JPG, PNG o WEBP · máximo 5 MB por archivo.
                    </p>
                </div>
            )}
        </section>
    );
}
