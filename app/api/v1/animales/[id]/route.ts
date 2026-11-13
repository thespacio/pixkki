// app/api/v1/animales/[id]/route.ts

import type { NextRequest } from "next/server";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../route-helpers";

type RouteContext = { params: { id: string } };

/** RF1.1: detalle del expediente (404 ante acceso cruzado entre refugios). */
export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalService();
        const animal = await service.getById(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );

        return apiSuccess(animal);
    } catch (error) {
        return handleApiError(error);
    }
}
