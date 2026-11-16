// app/api/v1/animales/[id]/cuarentena/route.ts
import type { NextRequest } from "next/server";
import { createAnimalQuarantineService } from "@/modules/animals/factories/create-animal-quarantine-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalQuarantineService();
        const estado = await service.getStatus(parseRouteId(params.id, "Animal"), getAnimalAccess(user));
        return apiSuccess(estado);
    } catch (error) {
        return handleApiError(error);
    }
}