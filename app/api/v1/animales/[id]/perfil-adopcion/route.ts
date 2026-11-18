import type { NextRequest } from "next/server";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { getCurrentUser } from "@/modules/auth";
import { createProfileService } from "@/modules/adoptions/factories/create-profile-service";
import { UpsertPerfilAdopcionBodySchema } from "@/modules/adoptions/validators/public-profile.validators";
import { parseRouteId } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const service = await createProfileService();
        const perfil = await service.get(parseRouteId(params.id, "Animal"), user);
        return apiSuccess(perfil);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const parsed = UpsertPerfilAdopcionBodySchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);
        const service = await createProfileService();
        const perfil = await service.upsert(parseRouteId(params.id, "Animal"), parsed.data, user);
        return apiSuccess(perfil);
    } catch (error) {
        return handleApiError(error);
    }
}