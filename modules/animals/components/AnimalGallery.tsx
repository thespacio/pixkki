"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImagePlus, Loader2, Star, Trash2, XCircle } from "lucide-react";
import type { AnimalImage } from "../repositories/animal-multimedia.repository";
import {
    MAX_IMAGENES_POR_ANIMAL,
    MAX_IMAGEN_BYTES,
    MIME_TYPES_PERMITIDOS,
} from "../types/animales.types";

type Props = {
    idAnimal: number;
    canEdit: boolean;
};

type ApiEnvelope<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } };

type UploadStatus = "pending" | "uploading" | "done" | "error";

type UploadItem = {
    key: string;
    nombre: string;
    progress: number;
    status: UploadStatus;
    error?: string;
};

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

function esMimePermitido(mime: string): boolean {
    return MIME_TYPES_PERMITIDOS.some((permitido) => permitido === mime);
}

/**
 * Galería del expediente (RF1.2, US06).
 * - Lista, sube (con progreso por archivo), elimina y elige portada.
 * - La subida usa XHR porque una Server Action limita el cuerpo a 1 MB.
 * - Cada archivo se envía en su propia petición para mostrar su progreso real.
 */
export function AnimalGallery({ idAnimal, canEdit }: Props) {
    const [imagenes, setImagenes] = useState<AnimalImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const load = useCallback(async () => {
        try {
            const response = await fetch(`/api/v1/animales/${idAnimal}/imagenes`, {
                cache: "no-store",
            });
            const result = await readEnvelope<{ imagenes: AnimalImage[] }>(response);
            if (!mountedRef.current) return;

            if (result.success) {
                setImagenes(result.data.imagenes);
            } else {
                setError(result.error.message);
            }
        } catch {
            if (mountedRef.current) setError("No se pudo cargar la galería.");
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [idAnimal]);

    useEffect(() => {
        async function initialLoad() {
            await load();
        }
        void initialLoad();
    }, [load]);

    function updateUpload(key: string, patch: Partial<UploadItem>) {
        if (!mountedRef.current) return;
        setUploads((prev) =>
            prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
        );
    }

    function uploadOne(file: File, key: string): Promise<boolean> {
        return new Promise((resolve) => {
            const formData = new FormData();
            formData.append("files", file);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", `/api/v1/animales/${idAnimal}/imagenes`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    updateUpload(key, {
                        status: "uploading",
                        progress: Math.round((event.loaded / event.total) * 100),
                    });
                }
            };

            xhr.onload = () => {
                try {
                    const result = JSON.parse(xhr.responseText) as ApiEnvelope<unknown>;
                    if (xhr.status >= 200 && xhr.status < 300 && result.success) {
                        updateUpload(key, { status: "done", progress: 100 });
                        resolve(true);
                    } else {
                        updateUpload(key, {
                            status: "error",
                            error: result.success
                                ? "No se pudo subir la imagen."
                                : result.error.message,
                        });
                        resolve(false);
                    }
                } catch {
                    updateUpload(key, {
                        status: "error",
                        error: "No se pudo subir la imagen.",
                    });
                    resolve(false);
                }
            };

            xhr.onerror = () => {
                updateUpload(key, {
                    status: "error",
                    error: "No se pudo subir la imagen.",
                });
                resolve(false);
            };

            xhr.send(formData);
        });
    }

    async function subir(files: FileList | null) {
        if (!files || files.length === 0) return;

        setError(null);

        const disponibles = Math.max(0, MAX_IMAGENES_POR_ANIMAL - imagenes.length);
        const aceptados: File[] = [];
        const rechazados: string[] = [];

        for (const file of Array.from(files)) {
            if (aceptados.length >= disponibles) {
                rechazados.push(
                    `${file.name}: se alcanzó el límite de ${MAX_IMAGENES_POR_ANIMAL} imágenes.`,
                );
                continue;
            }
            if (!esMimePermitido(file.type)) {
                rechazados.push(`${file.name}: solo se permiten JPG, PNG o WEBP.`);
                continue;
            }
            if (file.size > MAX_IMAGEN_BYTES) {
                rechazados.push(`${file.name}: supera el máximo de 5 MB.`);
                continue;
            }
            aceptados.push(file);
        }

        if (rechazados.length > 0) setError(rechazados.join(" "));
        if (inputRef.current) inputRef.current.value = "";

        if (aceptados.length === 0) return;

        const base = Date.now();
        const items: UploadItem[] = aceptados.map((file, index) => ({
            key: `${base}-${index}`,
            nombre: file.name,
            progress: 0,
            status: "pending",
        }));

        setUploads(items);
        setUploading(true);

        // Secuencial: el servidor valida el límite total (existentes + nuevas) en
        // cada petición y la primera imagen queda como portada del expediente.
        for (let index = 0; index < aceptados.length; index += 1) {
            await uploadOne(aceptados[index], items[index].key);
        }

        if (!mountedRef.current) return;
        setUploading(false);
        await load();
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
                        onChange={(event) => {
                            void subir(event.target.files);
                        }}
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

                    {uploads.length > 0 && (
                        <ul className="mt-3 space-y-2" aria-live="polite">
                            {uploads.map((item) => (
                                <li
                                    key={item.key}
                                    className="rounded-lg border border-border px-2.5 py-2"
                                >
                                    <div className="flex items-center justify-between gap-2 text-[11px]">
                                        <span className="truncate text-foreground">
                                            {item.nombre}
                                        </span>
                                        <span
                                            className={
                                                item.status === "error"
                                                    ? "shrink-0 text-red-600"
                                                    : item.status === "done"
                                                        ? "shrink-0 text-green-700"
                                                        : "shrink-0 text-muted-foreground"
                                            }
                                        >
                                            {item.status === "pending" && "En espera"}
                                            {item.status === "uploading" && `${item.progress}%`}
                                            {item.status === "done" && (
                                                <span className="inline-flex items-center gap-1">
                                                    <CheckCircle2 size={11} aria-hidden="true" />
                                                    Listo
                                                </span>
                                            )}
                                            {item.status === "error" && (
                                                <span className="inline-flex items-center gap-1">
                                                    <XCircle size={11} aria-hidden="true" />
                                                    Error
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                item.status === "error"
                                                    ? "bg-red-500"
                                                    : item.status === "done"
                                                        ? "bg-green-500"
                                                        : "bg-primary"
                                            }`}
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>

                                    {item.error && (
                                        <p className="mt-1 text-[10px] text-red-600">
                                            {item.error}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="mt-1 text-[11px] text-muted-foreground">
                        JPG, PNG o WEBP · máximo 5 MB por archivo.
                    </p>
                </div>
            )}
        </section>
    );
}
