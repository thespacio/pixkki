// lib/storage/cloudinary.adapter.ts

import { StorageAdapter, UploadFile, UploadResult } from "./storage.adapter";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Adaptador de Cloudinary sobre su REST API (fetch nativo).
 * - Sube la imagen original.
 * - Genera la miniatura 300x300 mediante transformación de URL en tiempo de entrega.
 * - No requiere instalar el paquete npm `cloudinary`.
 */
export class CloudinaryStorageAdapter implements StorageAdapter {
    private requireConfig(): void {
        if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
            throw new Error(
                "Cloudinary no está configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET."
            );
        }
    }

    async upload(file: UploadFile): Promise<UploadResult> {
        this.requireConfig();

        const folder = file.folder ?? "pixkki/animales";
        const timestamp = Math.floor(Date.now() / 1000);
        // Cloudinary exige una subida firmada: la firma cubre todos los
        // parámetros enviados salvo file, api_key y signature.
        const signature = await this.sign({ folder, timestamp });

        const formData = new FormData();
        const bytes = new Uint8Array(file.buffer.byteLength);
        bytes.set(file.buffer);
        formData.append("file", new Blob([bytes], { type: file.mimetype }), file.filename);
        formData.append("folder", folder);
        formData.append("api_key", API_KEY!);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cloudinary upload falló (${response.status}): ${errorText}`);
        }

        const data = (await response.json()) as {
            secure_url: string;
            public_id: string;
            format: string;
            bytes: number;
        };

        const url_thumbnail = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_300,h_300,c_fill/${data.public_id}.${data.format}`;

        return {
            url_publica: data.secure_url,
            url_thumbnail,
            formato: data.format,
            tamano_bytes: data.bytes,
            public_id: data.public_id,
        };
    }

    async destroy(publicId: string): Promise<void> {
        this.requireConfig();

        const timestamp = Math.floor(Date.now() / 1000);
        const signature = await this.sign({ public_id: publicId, timestamp });

        const formData = new FormData();
        formData.append("public_id", publicId);
        formData.append("api_key", API_KEY!);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);

        const destroyUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;

        const response = await fetch(destroyUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[cloudinary.adapter] destroy falló:", errorText);
        }
    }

    private async sign(params: Record<string, string | number>): Promise<string> {
        const sorted = Object.keys(params)
            .sort()
            .map((key) => `${key}=${params[key]}`)
            .join("&");
        const toSign = `${sorted}${API_SECRET!}`;

        const encoder = new TextEncoder();
        const data = encoder.encode(toSign);
        const hashBuffer = await crypto.subtle.digest("SHA-1", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
}

export const cloudinaryStorage = new CloudinaryStorageAdapter();