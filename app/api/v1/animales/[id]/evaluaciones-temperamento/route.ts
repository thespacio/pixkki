// app/api/v1/animales/[id]/evaluaciones-temperamento/route.ts
import type { NextRequest } from "next/server";
import { createAnimalTemperamentService } from "@/modules/animals/factories/create-animal-temperament-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { CreateEvaluacionTemperamentoSchema } from "@/modules/animals/validators/animal-temperament.validators";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalTemperamentService();
        const evaluaciones = await service.list(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );
        return apiSuccess({ evaluaciones });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateEvaluacionTemperamentoSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalTemperamentService();
        const evaluacion = await service.create(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ evaluacion }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
