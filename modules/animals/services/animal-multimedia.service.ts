// modules/animals/services/animal-multimedia.service.ts

import type {
    AnimalImage,
    AnimalMultimediaRepository,
} from "../repositories/animal-multimedia.repository";
import {
    MAX_IMAGENES_POR_ANIMAL,
    MAX_IMAGEN_BYTES,
    MIME_TYPES_PERMITIDOS,
    type MimeTypePermitido,
} from "../types/animales.types";
import {
    AnimalImageLimitError,
    AnimalImageRequiredError,
    AnimalImageSizeError,
    AnimalImageTypeError,
} from "../types/animales.types";
import type { AnimalAccess } from "../access";

export type IncomingImage = {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    size: number;
};

/**
 * Detecta el tipo real de la imagen por sus magic bytes (no por la extensión).
 * Devuelve null si el contenido no es JPG, PNG ni WEBP.
 */
export function detectImageMime(buffer: Buffer): MimeTypePermitido | null {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }

    if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return "image/png";
    }

    if (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
        return "image/webp";
    }

    return null;
}

/** Algunos navegadores envían `image/jpg` en lugar del estándar `image/jpeg`. */
function normalizarMime(mime: string): string {
    return mime.toLowerCase() === "image/jpg" ? "image/jpeg" : mime.toLowerCase();
}

function esMimePermitido(mime: string): mime is MimeTypePermitido {
    return (MIME_TYPES_PERMITIDOS as readonly string[]).includes(mime);
}

/**
 * Servicio de negocio para gestión de multimedia del expediente (RF1.2, US06).
 * Lógica pura: no accede a Supabase ni a Cloudinary directamente.
 *
 * Reglas:
 * - Entre 1 y 5 imágenes por expediente (existentes + nuevas).
 * - JPG, PNG o WEBP validados por contenido real.
 * - Máximo 5 MB por archivo.
 * - La primera imagen del expediente se designa portada.
 */
export class AnimalMultimediaService {
    constructor(private readonly repository: AnimalMultimediaRepository) {}

    /** `null` para superadmin: el repository omite el filtro de refugio. */
    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    private validateImage(file: IncomingImage): MimeTypePermitido {
        if (file.size > MAX_IMAGEN_BYTES || file.buffer.length > MAX_IMAGEN_BYTES) {
            throw new AnimalImageSizeError();
        }

        const detected = detectImageMime(file.buffer);
        if (!detected) throw new AnimalImageTypeError();

        const declarado = normalizarMime(file.mimetype);
        if (declarado && declarado !== "application/octet-stream" && declarado !== detected) {
            throw new AnimalImageTypeError();
        }

        if (!esMimePermitido(detected)) throw new AnimalImageTypeError();
        return detected;
    }

    async uploadImages(
        idAnimal: number,
        access: AnimalAccess,
        files: IncomingImage[],
    ): Promise<AnimalImage[]> {
        if (files.length === 0) throw new AnimalImageRequiredError();

        const idRefugio = this.refugioDe(access);
        const existentes = await this.repository.countByAnimal(idAnimal, idRefugio);
        if (existentes + files.length > MAX_IMAGENES_POR_ANIMAL) {
            throw new AnimalImageLimitError();
        }

        // Validar todos los archivos antes de subir el primero: evita subidas
        // parciales cuando un archivo del lote es inválido.
        const validados = files.map((file) => ({
            file,
            mimetype: this.validateImage(file),
        }));

        const subidas: AnimalImage[] = [];
        try {
            for (let index = 0; index < validados.length; index += 1) {
                const { file, mimetype } = validados[index];
                const esPortada = existentes === 0 && index === 0;

                const imagen = await this.repository.upload(
                    idAnimal,
                    idRefugio,
                    {
                        buffer: file.buffer,
                        filename: file.filename,
                        mimetype,
                    },
                    esPortada,
                    existentes + index,
                );

                subidas.push(imagen);
            }

            return subidas;
        } catch (error) {
            // Compensación: deshacer las imágenes ya insertadas en este lote.
            await Promise.all(
                subidas.map((imagen) =>
                    this.repository
                        .delete(imagen.idImagen, idAnimal, idRefugio)
                        .catch(() => undefined),
                ),
            );
            throw error;
        }
    }

    async listImages(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AnimalImage[]> {
        return this.repository.listByAnimal(idAnimal, this.refugioDe(access));
    }

    async deleteImage(
        idImagen: number,
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<void> {
        return this.repository.delete(
            idImagen,
            idAnimal,
            this.refugioDe(access),
        );
    }

    async setPortada(
        idImagen: number,
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AnimalImage> {
        return this.repository.setPortada(
            idImagen,
            idAnimal,
            this.refugioDe(access),
        );
    }
}
