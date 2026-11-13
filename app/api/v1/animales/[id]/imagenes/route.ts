// app/api/v1/animales/[id]/imagenes/route.ts

import type { NextRequest } from "next/server";
import { createAnimalMultimediaService } from "@/modules/animals/factories/create-animal-multimedia-service";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";
import type { IncomingImage } from "@/modules/animals/services/animal-multimedia.service";

type RouteContext = { params: { id: string } };

/** RF1.2: galería del expediente (US06). */
export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalMultimediaService();
        const imagenes = await service.listImages(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );

        return apiSuccess({ imagenes });
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * RF1.2: subida multipart de 1 a 5 imágenes (US06).
 * El Route Handler es necesario porque una Server Action limita el body a 1 MB.
 *
 * Los metadatos (tamaño, tipo real por magic bytes) se validan en el service,
 * que devuelve errores de dominio 400 con mensajes en español.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser(
            ANIMAL_PERMISSIONS.edit,
            "gestionar imágenes",
        );
        const idAnimal = parseRouteId(params.id, "Animal");

        const formData = await request.formData();
        const entries = [
            ...formData.getAll("files"),
            ...formData.getAll("file"),
        ];
        const archivos = entries.filter((entry): entry is File => entry instanceof File);

        if (archivos.length === 0) {
            return apiError(
                "ARCHIVO_REQUERIDO",
                "Debes seleccionar al menos una imagen.",
                400,
            );
        }

        const files: IncomingImage[] = await Promise.all(
            archivos.map(async (archivo) => ({
                buffer: Buffer.from(await archivo.arrayBuffer()),
                filename: archivo.name,
                mimetype: archivo.type,
                size: archivo.size,
            })),
        );

        const service = await createAnimalMultimediaService();
        const imagenes = await service.uploadImages(
            idAnimal,
            getAnimalAccess(user),
            files,
        );

        return apiSuccess({ imagenes }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
