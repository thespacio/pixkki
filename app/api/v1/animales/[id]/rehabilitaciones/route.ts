// app/api/v1/animales/[id]/rehabilitaciones/route.ts
import type { NextRequest } from "next/server";
import { createAnimalRehabilitationService } from "@/modules/animals/factories/create-animal-rehabilitation-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { CreateRehabilitacionSchema } from "@/modules/animals/validators/animal-rehabilitation.validators";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalRehabilitationService();
        const rehabilitaciones = await service.list(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );
        return apiSuccess({ rehabilitaciones });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateRehabilitacionSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalRehabilitationService();
        const rehabilitacion = await service.create(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ rehabilitacion }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
