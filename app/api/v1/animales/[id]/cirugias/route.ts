// app/api/v1/animales/[id]/cirugias/route.ts
import type { NextRequest } from "next/server";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { createAnimalSurgeryService } from "@/modules/animals/factories/create-animal-surgery-service";
import { CreateCirugiaBodySchema } from "@/modules/animals/validators/animal-surgery.validators";
import {
    apiSuccess,
    apiValidationError,
    handleApiError,
} from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalSurgeryService();
        const cirugias = await service.list(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );
        return apiSuccess({ cirugias });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser(
            ANIMAL_PERMISSIONS.edit,
            "registrar cirugías",
        );
        const parsed = CreateCirugiaBodySchema.safeParse(
            await readJsonBody(request),
        );
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalSurgeryService();
        const cirugia = await service.create(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ cirugia }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
