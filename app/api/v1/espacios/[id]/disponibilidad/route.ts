// app/api/v1/espacios/[id]/disponibilidad/route.ts
// RF3.1: consulta de disponibilidad y ocupación de un espacio.
import type { NextRequest } from "next/server";
import { createSpaceOccupancyService } from "@/modules/spaces/factories/create-space-occupancy-service";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/responses";
import {
    parseRouteId,
    requireSpaceUser,
    spaceScope,
} from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireSpaceUser();
        const service = await createSpaceOccupancyService();
        const disponibilidad = await service.getOccupancy(
            parseRouteId(params.id, "Espacio"),
            spaceScope(user),
        );

        if (!disponibilidad) {
            return apiError("ESPACIO_NO_ENCONTRADO", "Espacio no encontrado.", 404);
        }
        return apiSuccess(disponibilidad);
    } catch (error) {
        return handleApiError(error);
    }
}
