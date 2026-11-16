// app/api/v1/animales/[id]/chequeos/route.ts
import type { NextRequest } from "next/server";
import { createAnimalCheckupService } from "@/modules/animals/factories/create-animal-checkup-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { CreateChequeoSchema } from "@/modules/animals/validators/animal.validators";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalCheckupService();
        const chequeos = await service.list(parseRouteId(params.id, "Animal"), getAnimalAccess(user));
        return apiSuccess({ chequeos });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateChequeoSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalCheckupService();
        const chequeo = await service.create(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ chequeo }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}