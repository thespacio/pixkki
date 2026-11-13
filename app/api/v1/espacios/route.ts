// app/api/v1/espacios/route.ts
//
// API v1 de espacios (requerimiento-00, F-SHELTER-04):
//   GET  /api/v1/espacios  — listado con alcance de tenant.
//   POST /api/v1/espacios  — alta (Admin/Superadmin).

import type { NextRequest } from "next/server";

import { isSuperadmin } from "@/modules/auth/authorization";
import { createSpaceService } from "@/modules/spaces/factories/factories";
import { CreateSpaceApiSchema } from "@/modules/spaces/schemas";
import type { SpaceFilters } from "@/modules/spaces/types/types";
import { createShelterService } from "@/modules/shelters/factories";
import { apiError, apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import {
    readBooleanParam,
    readJsonBody,
    readPositiveIntParam,
} from "@/lib/api/request";
import { requireSpaceManager, requireSpaceUser, spaceScope } from "./route-helpers";

/** Listado de espacios visibles para el usuario en sesión. */
export async function GET(request: NextRequest) {
    try {
        const user = await requireSpaceUser();
        const params = request.nextUrl.searchParams;

        const filters: SpaceFilters = {
            shelterId: isSuperadmin(user)
                ? readPositiveIntParam(params.get("shelterId"))
                : spaceScope(user),
            available: readBooleanParam(params.get("available")),
            type: params.get("type") ?? undefined,
            searchTerm: params.get("search") ?? undefined,
        };

        const service = await createSpaceService();
        const espacios = await service.getSpaces(filters);

        return apiSuccess({ espacios, total: espacios.length });
    } catch (error) {
        return handleApiError(error);
    }
}

/** Alta de espacio. El superadmin debe indicar `shelterId` en el cuerpo. */
export async function POST(request: NextRequest) {
    try {
        const user = await requireSpaceUser();
        requireSpaceManager(user);

        const parsed = CreateSpaceApiSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const { shelterId: requestedShelterId, ...dto } = parsed.data;

        let shelterId: number;

        if (isSuperadmin(user)) {
            if (!requestedShelterId) {
                return apiError(
                    "VALIDATION_ERROR",
                    "Debes indicar el refugio (shelterId) donde crear el espacio.",
                    400,
                );
            }

            // Verifica que el refugio exista (y autoriza al superadmin).
            await (await createShelterService()).findById(requestedShelterId, user);
            shelterId = requestedShelterId;
        } else {
            if (user.shelterId === null) {
                return apiError(
                    "FORBIDDEN",
                    "El usuario no tiene un refugio asignado.",
                    403,
                );
            }
            shelterId = user.shelterId;
        }

        const service = await createSpaceService();
        const space = await service.createSpace({ dto, shelterId });

        return apiSuccess(space, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
