// app/api/v1/animales/[id]/eventos-sanitarios/route.ts
import type { NextRequest } from "next/server";
import { createAnimalSanitaryEventService } from "@/modules/animals/factories/create-animal-sanitary-event-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { CreateEventoSanitarioSchema } from "@/modules/animals/validators/animal-sanitary-event.validators";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalSanitaryEventService();
        const eventos = await service.list(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );
        return apiSuccess({ eventos });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateEventoSanitarioSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalSanitaryEventService();
        const evento = await service.create(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );
        return apiSuccess({ evento }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
