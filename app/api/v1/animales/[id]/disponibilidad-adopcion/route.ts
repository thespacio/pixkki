// app/api/v1/animales/[id]/disponibilidad-adopcion/route.ts
import type { NextRequest } from "next/server";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { createAnimalAdoptionService } from "@/modules/animals/factories/create-animal-adoption-service";
import { UpdateDisponibilidadAdopcionBodySchema } from "@/modules/animals/validators/animal-adoption-aptitude.validators";
import {
    apiSuccess,
    apiValidationError,
    handleApiError,
} from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser(
            ANIMAL_PERMISSIONS.edit,
            "cambiar la disponibilidad de adopción",
        );
        const parsed = UpdateDisponibilidadAdopcionBodySchema.safeParse(
            await readJsonBody(request),
        );
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalAdoptionService();
        const disponibilidad = await service.setDisponibility(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ disponibilidad });
    } catch (error) {
        return handleApiError(error);
    }
}
