import type { NextRequest } from "next/server";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody, parseRouteId } from "@/lib/api/request";
import { getCurrentUser } from "@/modules/auth";
import { createAdoptionStateService } from "@/modules/adoptions/factories/create-adoption-service";
import { CompletarAdopcionBodySchema } from "@/modules/adoptions/validators/state.validators";

type RouteContext = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const parsed = CompletarAdopcionBodySchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);
        const service = await createAdoptionStateService();
        const result = await service.complete(parseRouteId(params.id, "Solicitud"), parsed.data, user);
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}