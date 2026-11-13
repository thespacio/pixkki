// app/api/v1/animales/[id]/imagenes/[idImagen]/route.ts

import type { NextRequest } from "next/server";
import { createAnimalMultimediaService } from "@/modules/animals/factories/create-animal-multimedia-service";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../../../route-helpers";

type RouteContext = { params: { id: string; idImagen: string } };

/** RF1.2: elimina una imagen del expediente (US06). */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser(
            ANIMAL_PERMISSIONS.edit,
            "gestionar imágenes",
        );

        const service = await createAnimalMultimediaService();
        await service.deleteImage(
            parseRouteId(params.idImagen, "Imagen"),
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );

        return apiSuccess({ eliminada: true });
    } catch (error) {
        return handleApiError(error);
    }
}
