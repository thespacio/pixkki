"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ImagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalForm } from "./AnimalForm";
import { createAnimalAction } from "../actions/animal.actions";
import {
    toCreateAnimalInput,
    type CreateAnimalFormValues,
} from "../validators/animal.validators";
import { Space } from "@/modules/spaces/types/types";
import { AnimalState } from "@/modules/animals/types/animal-state.types";
import {
    MAX_IMAGENES_POR_ANIMAL,
    MAX_IMAGEN_BYTES,
    MIME_TYPES_PERMITIDOS,
    type MimeTypePermitido,
} from "@/modules/animals/types/animales.types";
import type { ShelterOption } from "@/modules/animals/components/AnimalFilterBar";

type Photo = { file: File; url: string };

type Props = {
    /**
     * @deprecated El alta ya no elige estado. Se conserva como prop opcional
     * para no romper consumidores/tests antiguos; el formulario la ignora.
     */
    estados?: AnimalState[];
    espacios: Space[];
    /** Solo superadmin: albergues entre los que elegir. Vacío = se usa el albergue del usuario. */
    refugios?: ShelterOption[];
    /**
     * `false` si el catálogo `animal_estado` no tiene "Cuarentena". El botón se
     * deshabilita y el servidor vuelve a rechazar el alta si se fuerza.
     */
    quarantineAvailable?: boolean;
};

/** Sube una imagen con progreso real (una petición por archivo, como la galería). */
function uploadImage(
    idAnimal: number,
    file: File,
    onProgress: (percent: number) => void,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/v1/animales/${idAnimal}/imagenes`);
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
                return;
            }
            let message = "No se pudo subir la imagen.";
            try {
                const body = JSON.parse(xhr.responseText) as {
                    error?: { message?: string };
                };
                if (body.error?.message) message = body.error.message;
            } catch {
                // Se conserva el mensaje genérico.
            }
            reject(new Error(message));
        };
        xhr.onerror = () =>
            reject(new Error("No se pudo conectar con el servidor."));

        const formData = new FormData();
        formData.append("files", file);
        xhr.send(formData);
    });
}

export function CreateAnimalModal({
    espacios,
    refugios = [],
    quarantineAvailable = true,
}: Props) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<string | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const photosRef = useRef<Photo[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        photosRef.current = photos;
    }, [photos]);

    useEffect(
        () => () => {
            photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
        },
        [],
    );

    useEffect(
        () => () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        },
        [],
    );

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, saving]);

    function openModal() {
        if (!quarantineAvailable) return;
        setError(null);
        setOpen(true);
    }

    function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
        const seleccionadas = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (seleccionadas.length === 0) return;

        const validas = seleccionadas.filter(
            (file) =>
                MIME_TYPES_PERMITIDOS.includes(file.type as MimeTypePermitido) &&
                file.size <= MAX_IMAGEN_BYTES,
        );
        if (validas.length !== seleccionadas.length) {
            setError(
                "Algunas imágenes no se agregaron. Usa JPG, PNG o WEBP de hasta 5 MB.",
            );
        } else {
            setError(null);
        }
        const nuevas: Photo[] = validas.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setPhotos((prev) =>
            [...prev, ...nuevas].slice(0, MAX_IMAGENES_POR_ANIMAL),
        );
    }

    function removeFile(index: number) {
        const foto = photos[index];
        if (!foto) return;
        URL.revokeObjectURL(foto.url);
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(values: CreateAnimalFormValues) {
        setSaving(true);
        setError(null);
        try {
            const result = await createAnimalAction(toCreateAnimalInput(values));
            if (!result.success) {
                setError(result.error);
                return;
            }

            const nombre = result.data.nombre ?? `${result.data.especie} sin nombre`;
            const seleccionadas = photos.map((photo) => photo.file);
            let fotoError = false;
            if (seleccionadas.length > 0) {
                for (let index = 0; index < seleccionadas.length; index++) {
                    try {
                        await uploadImage(
                            result.data.idAnimal,
                            seleccionadas[index],
                            (percent) =>
                                setUploadProgress(
                                    Math.round(
                                        ((index + percent / 100) /
                                            seleccionadas.length) *
                                            100,
                                    ),
                                ),
                        );
                    } catch (uploadError) {
                        fotoError = true;
                        setError(
                            uploadError instanceof Error
                                ? uploadError.message
                                : "No se pudo subir una imagen.",
                        );
                        break;
                    }
                }
                setUploadProgress(null);
            }
            const totalFotos = fotoError ? 0 : seleccionadas.length;
            photos.forEach((photo) => URL.revokeObjectURL(photo.url));
            setPhotos([]);
            setOpen(false);
            setCreated(
                fotoError
                    ? `${nombre} se registró, pero no se pudieron subir las fotos. Puedes hacerlo desde su ficha.`
                    : totalFotos > 0
                      ? `${nombre} se registró con ${totalFotos} ${totalFotos === 1 ? "foto" : "fotos"}.`
                      : `${nombre} se registró correctamente. Puedes agregar imágenes desde su ficha.`,
            );
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setCreated(null), 5000);
        } catch {
            setError(
                "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="flex items-center gap-3">
                {created && (
                    <span
                        role="status"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                    >
                        <CheckCircle2 size={14} aria-hidden="true" />
                        {created}
                    </span>
                )}
                {!quarantineAvailable && (
                    <span role="status" className="text-xs text-red-600">
                        No se puede registrar: falta el estado «Cuarentena» en el
                        catálogo.
                    </span>
                )}
                <Button
                    onClick={openModal}
                    disabled={!quarantineAvailable}
                    title={
                        quarantineAvailable
                            ? undefined
                            : "El catálogo de estados no tiene «Cuarentena»"
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                    <Plus size={15} aria-hidden="true" /> Registrar animal
                </Button>
            </div>

            {open && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                    onClick={() => !saving && setOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-animal-title"
                        className="bg-background rounded-2xl border border-border w-full max-w-3xl p-6 shadow-xl my-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3
                                id="create-animal-title"
                                className="text-lg font-semibold text-foreground"
                            >
                                Registrar animal
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                disabled={saving}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                            <p className="font-medium">
                                Todo ingreso se registra en cuarentena.
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                El estado del paciente se asigna automáticamente y no
                                se puede cambiar desde este formulario.
                            </p>
                        </div>

                        <div className="mb-4 rounded-xl border border-border p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs font-semibold text-foreground">
                                        Fotos (opcional)
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        JPG, PNG o WEBP · máx. 5 MB · hasta{" "}
                                        {MAX_IMAGENES_POR_ANIMAL} fotos. Se suben al
                                        guardar el expediente.
                                    </p>
                                </div>
                                <label
                                    className={`inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary ${
                                        saving || photos.length >= MAX_IMAGENES_POR_ANIMAL
                                            ? "cursor-not-allowed opacity-50"
                                            : "cursor-pointer"
                                    }`}
                                >
                                    <ImagePlus size={14} aria-hidden="true" />
                                    Agregar imágenes
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={onFilesSelected}
                                        disabled={
                                            saving ||
                                            photos.length >= MAX_IMAGENES_POR_ANIMAL
                                        }
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {photos.length > 0 && (
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {photos.map((photo, index) => (
                                        <li
                                            key={photo.url}
                                            className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-secondary"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo.url}
                                                alt={photo.file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                disabled={saving}
                                                aria-label={`Quitar ${photo.file.name}`}
                                                className="absolute right-0.5 top-0.5 rounded-full bg-foreground/80 p-0.5 text-background disabled:opacity-50"
                                            >
                                                <X size={11} aria-hidden="true" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {uploadProgress !== null && (
                                <div
                                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"
                                    role="progressbar"
                                    aria-valuenow={uploadProgress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <AnimalForm
                            espacios={espacios}
                            refugios={refugios}
                            onSubmit={handleSubmit}
                            submitLabel="Registrar animal"
                            saving={saving}
                            onCancel={() => setOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
