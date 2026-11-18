// app/api/v1/animales/[id]/traslados/route.ts
import type { NextRequest } from "next/server";
import { createAnimalTransferService } from "@/modules/animals/factories/create-animal-transfer-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { CreateTrasladoSchema } from "@/modules/animals/validators/animal-transfer.validators";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalTransferService();
        const traslados = await service.list(parseRouteId(params.id, "Animal"), getAnimalAccess(user));
        return apiSuccess({ traslados });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateTrasladoSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalTransferService();
        const traslado = await service.create(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ traslado }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
