// app/api/v1/espacios/[id]/route.ts
//
//   GET    /api/v1/espacios/{id}  — detalle (404 si es de otro refugio).
//   PATCH  /api/v1/espacios/{id}  — edición parcial (Admin/Superadmin).
//   DELETE /api/v1/espacios/{id}  — baja si está vacío (Admin/Superadmin).

import type { NextRequest } from "next/server";

import { createSpaceService } from "@/modules/spaces/factories/factories";
import { UpdateSpaceApiSchema } from "@/modules/spaces/schemas";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { parseRouteId, requireSpaceManager, requireSpaceUser, spaceScope } from "../route-helpers";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireSpaceUser();
        const service = await createSpaceService();
        const space = await service.getSpaceById(
            parseRouteId(params.id, "Espacio"),
            spaceScope(user),
        );

        return apiSuccess(space);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireSpaceUser();
        requireSpaceManager(user);

        const id = parseRouteId(params.id, "Espacio");
        const parsed = UpdateSpaceApiSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const scope = spaceScope(user);
        const service = await createSpaceService();

        // PATCH parcial: se completa con los valores actuales para reutilizar
        // las reglas de negocio de `SpaceService.updateSpace`.
        const current = await service.getSpaceById(id, scope);
        const updates = {
            name: current.name,
            description: current.description,
            capacity: current.capacity,
            type: current.type,
            available: current.available,
            ...parsed.data,
        };

        const space = await service.updateSpace(id, updates, scope);

        return apiSuccess(space);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireSpaceUser();
        requireSpaceManager(user);

        const id = parseRouteId(params.id, "Espacio");
        const service = await createSpaceService();

        await service.deleteSpace(id, spaceScope(user));

        return apiSuccess({ id });
    } catch (error) {
        return handleApiError(error);
    }
}
