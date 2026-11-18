import type { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId } from "@/lib/api/request";
import { getCurrentUser } from "@/modules/auth";
import { createApplicationService } from "@/modules/adoptions/factories/create-application-service";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const service = await createApplicationService();
        const result = await service.getById(parseRouteId(params.id, "Solicitud"), user);
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}