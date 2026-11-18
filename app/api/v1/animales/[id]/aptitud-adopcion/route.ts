// app/api/v1/animales/[id]/aptitud-adopcion/route.ts
import type { NextRequest } from "next/server";
import { getAnimalAccess } from "@/modules/animals/access";
import { createAnimalAdoptionService } from "@/modules/animals/factories/create-animal-adoption-service";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalAdoptionService();
        const aptitud = await service.evaluate(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );
        return apiSuccess({ aptitud });
    } catch (error) {
        return handleApiError(error);
    }
}
