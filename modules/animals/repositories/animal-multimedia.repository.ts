// modules/animals/repositories/animal-multimedia.repository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import type { StorageAdapter } from "@/lib/storage/storage.adapter";
import {
    AnimalImageNotFoundError,
    AnimalNotFoundError,
} from "../types/animales.types";

type FotografiaRow = Database["public"]["Tables"]["fotografia"]["Row"];
type FotografiaInsert = Database["public"]["Tables"]["fotografia"]["Insert"];

const SELECT_COLUMNS = `
    id_fotografia,
    id_animal,
    nombre_archivo,
    url_archivo,
    url_thumbnail,
    es_principal,
    orden,
    formato,
    tamano_mb,
    public_id,
    fecha_subida
`;

/** Imagen del expediente expuesta al dominio (camelCase). */
export type AnimalImage = {
    idImagen: number;
    idAnimal: number;
    urlPublica: string;
    urlThumbnail: string | null;
    esPortada: boolean;
    orden: number;
    formato: string | null;
    tamanoBytes: number | null;
    nombreArchivo: string;
    fechaSubida: string;
};

const MB = 1024 * 1024;

/**
 * `fotografia.formato` tiene el check `chk_foto_formato` (JPG, JPEG, PNG, WEBP).
 * Cloudinary devuelve el formato en minúsculas, así que se normaliza antes de
 * insertar; si no, PostgREST devuelve 23514 y el alta pierde sus imágenes.
 */
const FORMATOS_PERMITIDOS = new Set(["JPG", "JPEG", "PNG", "WEBP"]);

function normalizeFormato(formato: string | null | undefined): string | null {
    const normalized = (formato ?? "").trim().toUpperCase();
    return FORMATOS_PERMITIDOS.has(normalized) ? normalized : null;
}

function toDomain(row: FotografiaRow): AnimalImage {
    return {
        idImagen: row.id_fotografia,
        idAnimal: row.id_animal,
        urlPublica: row.url_archivo,
        urlThumbnail: row.url_thumbnail,
        esPortada: row.es_principal,
        orden: row.orden,
        formato: row.formato,
        tamanoBytes: row.tamano_mb !== null ? Math.round(row.tamano_mb * MB) : null,
        nombreArchivo: row.nombre_archivo,
        fechaSubida: row.fecha_subida,
    };
}

/**
 * Repository de archivos multimedia del expediente.
 * Único punto de acceso a Supabase para `fotografia`.
 *
 * La tabla real no tiene `id_refugio`: el aislamiento multitenant se garantiza
 * comprobando que el animal pertenezca al refugio de la sesión antes de cada
 * operación.
 */
export class AnimalMultimediaRepository {
    constructor(
        private readonly supabase: SupabaseClient<Database>,
        private readonly storage: StorageAdapter,
    ) {}

    /**
     * 404 cuando el animal no existe o pertenece a otro refugio.
     * `idRefugio === null` significa superadmin: se omite el filtro de tenant.
     * Devuelve el refugio real del animal (para la carpeta de Cloudinary).
     */
    private async assertAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<number> {
        let query = this.supabase
            .from("animal")
            .select("id_animal, id_refugio")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);

        if (idRefugio !== null) {
            query = query.eq("id_refugio", idRefugio);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        if (!data) throw new AnimalNotFoundError(idAnimal);
        return data.id_refugio;
    }

    /** Total de imágenes del expediente (para el límite de 5). */
    async countByAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<number> {
        await this.assertAnimal(idAnimal, idRefugio);

        const { count, error } = await this.supabase
            .from("fotografia")
            .select("id_fotografia", { count: "exact", head: true })
            .eq("id_animal", idAnimal);

        if (error) throw error;
        return count ?? 0;
    }

    /** Sube una imagen a Cloudinary y la registra en `fotografia`. */
    async upload(
        idAnimal: number,
        idRefugio: number | null,
        file: { buffer: Buffer; filename: string; mimetype: string },
        esPortada: boolean,
        orden: number,
    ): Promise<AnimalImage> {
        const refugioReal = await this.assertAnimal(idAnimal, idRefugio);

        const upload = await this.storage.upload({
            buffer: file.buffer,
            filename: file.filename,
            mimetype: file.mimetype,
            folder: `pixkki/animales/${refugioReal}/${idAnimal}`,
        });

        try {
            // Si se designa portada, desmarcar las previas de este animal.
            if (esPortada) {
                const { error: unmarkError } = await this.supabase
                    .from("fotografia")
                    .update({ es_principal: false })
                    .eq("id_animal", idAnimal)
                    .eq("es_principal", true);

                if (unmarkError) throw unmarkError;
            }

            const insert: FotografiaInsert = {
                id_animal: idAnimal,
                nombre_archivo: file.filename,
                url_archivo: upload.url_publica,
                url_thumbnail: upload.url_thumbnail,
                es_principal: esPortada,
                orden,
                formato: normalizeFormato(upload.formato),
                // `chk_foto_tamano` exige > 0 y la columna es numeric(4,2): el
                // mínimo representable es 0.01, para que una imagen pequeña no
                // redondee a 0.00.
                tamano_mb: Math.max(0.01, Number((upload.tamano_bytes / MB).toFixed(2))),
                public_id: upload.public_id,
            };

            const { data, error } = await this.supabase
                .from("fotografia")
                .insert(insert)
                .select(SELECT_COLUMNS)
                .single();

            if (error) throw error;
            return toDomain(data);
        } catch (error) {
            // Compensación: no dejar el archivo huérfano en Cloudinary.
            await this.storage.destroy(upload.public_id).catch(() => undefined);
            throw error;
        }
    }

    /** Lista las imágenes de un animal (solo su refugio). */
    async listByAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<AnimalImage[]> {
        await this.assertAnimal(idAnimal, idRefugio);

        const { data, error } = await this.supabase
            .from("fotografia")
            .select(SELECT_COLUMNS)
            .eq("id_animal", idAnimal)
            .order("orden", { ascending: true })
            .order("id_fotografia", { ascending: true });

        if (error) throw error;
        return data.map(toDomain);
    }

    /**
     * Elimina una imagen (y su archivo en Cloudinary) si pertenece al expediente.
     * Si era la portada, designa automáticamente la primera imagen restante.
     */
    async delete(
        idImagen: number,
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<void> {
        await this.assertAnimal(idAnimal, idRefugio);

        const { data, error } = await this.supabase
            .from("fotografia")
            .select(SELECT_COLUMNS)
            .eq("id_fotografia", idImagen)
            .eq("id_animal", idAnimal)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new AnimalImageNotFoundError();

        if (data.public_id) {
            await this.storage.destroy(data.public_id).catch(() => undefined);
        }

        const { error: deleteError } = await this.supabase
            .from("fotografia")
            .delete()
            .eq("id_fotografia", idImagen)
            .eq("id_animal", idAnimal);

        if (deleteError) throw deleteError;

        if (data.es_principal) {
            const { data: siguiente, error: siguienteError } = await this.supabase
                .from("fotografia")
                .select("id_fotografia")
                .eq("id_animal", idAnimal)
                .order("orden", { ascending: true })
                .order("id_fotografia", { ascending: true })
                .limit(1)
                .maybeSingle();

            if (siguienteError) throw siguienteError;

            if (siguiente) {
                const { error: portadaError } = await this.supabase
                    .from("fotografia")
                    .update({ es_principal: true })
                    .eq("id_fotografia", siguiente.id_fotografia)
                    .eq("id_animal", idAnimal);

                if (portadaError) throw portadaError;
            }
        }
    }

    /** Designa una imagen como portada del animal (solo una portada por animal). */
    async setPortada(
        idImagen: number,
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<AnimalImage> {
        await this.assertAnimal(idAnimal, idRefugio);

        const { data: actual, error: actualError } = await this.supabase
            .from("fotografia")
            .select("id_fotografia")
            .eq("id_fotografia", idImagen)
            .eq("id_animal", idAnimal)
            .maybeSingle();

        if (actualError) throw actualError;
        if (!actual) throw new AnimalImageNotFoundError();

        const { error: unmarkError } = await this.supabase
            .from("fotografia")
            .update({ es_principal: false })
            .eq("id_animal", idAnimal)
            .eq("es_principal", true);

        if (unmarkError) throw unmarkError;

        const { data, error } = await this.supabase
            .from("fotografia")
            .update({ es_principal: true })
            .eq("id_fotografia", idImagen)
            .eq("id_animal", idAnimal)
            .select(SELECT_COLUMNS)
            .single();

        if (error) throw error;
        return toDomain(data);
    }
}
