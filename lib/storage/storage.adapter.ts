// lib/storage/storage.adapter.ts

/**
 * Contrato de almacenamiento de archivos multimedia.
 * Implementado por lib/storage/cloudinary.adapter.ts.
 * Consumido exclusivamente desde los repositories de animals.
 * (Requerimiento 01, Épica 1 — RF1.2 Gestión de archivos multimedia)
 */

export interface UploadResult {
    url_publica: string;
    url_thumbnail: string;
    formato: string;
    tamano_bytes: number;
    public_id: string;
}

export type UploadFile = {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    folder?: string;
};

export interface StorageAdapter {
    upload(file: UploadFile): Promise<UploadResult>;
    destroy(publicId: string): Promise<void>;
}