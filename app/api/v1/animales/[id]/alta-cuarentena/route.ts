// app/api/v1/animales/[id]/alta-cuarentena/route.ts
import type { NextRequest } from "next/server";
import { createAnimalQuarantineService } from "@/modules/animals/factories/create-animal-quarantine-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { CreateAltaCuarentenaSchema } from "@/modules/animals/validators/animal.validators";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateAltaCuarentenaSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalQuarantineService();
        const alta = await service.release(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ alta }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}