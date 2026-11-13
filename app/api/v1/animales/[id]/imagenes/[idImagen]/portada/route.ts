// app/api/v1/animales/[id]/imagenes/[idImagen]/portada/route.ts

import type { NextRequest } from "next/server";
import { createAnimalMultimediaService } from "@/modules/animals/factories/create-animal-multimedia-service";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../../../../route-helpers";

type RouteContext = { params: { id: string; idImagen: string } };

/** RF1.2: designa la imagen como portada del expediente (US06). */
export async function PATCH(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser(
            ANIMAL_PERMISSIONS.edit,
            "gestionar imágenes",
        );

        const service = await createAnimalMultimediaService();
        const imagen = await service.setPortada(
            parseRouteId(params.idImagen, "Imagen"),
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );

        return apiSuccess({ imagen });
    } catch (error) {
        return handleApiError(error);
    }
}
