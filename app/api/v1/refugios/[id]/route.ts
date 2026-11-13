// app/api/v1/refugios/[id]/route.ts
//
//   GET   /api/v1/refugios/{id}  — detalle (404 si es de otro refugio).
//   PATCH /api/v1/refugios/{id}  — edición parcial (superadmin o admin propio).

import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/modules/auth";
import { createShelterService } from "@/modules/shelters/factories";
import { UpdateShelterApiSchema } from "@/modules/shelters/schemas";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { parseRouteId, readJsonBody } from "@/lib/api/request";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const service = await createShelterService();
        const shelter = await service.findById(parseRouteId(params.id, "Refugio"), user);

        return apiSuccess(shelter);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const id = parseRouteId(params.id, "Refugio");

        const parsed = UpdateShelterApiSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createShelterService();

        // PATCH parcial: se completa con los valores actuales para reutilizar
        // las reglas de negocio de `ShelterService.update`.
        const current = await service.findById(id, user);
        const updates = {
            calle: current.calle,
            numero: current.numero,
            colonia: current.colonia,
            codigo_postal: current.codigo_postal,
            direccion: current.direccion,
            latitud: current.latitud,
            longitud: current.longitud,
            nombre_albergue: current.nombre_albergue,
            ciudad: current.ciudad,
            estado: current.estado,
            correo_contacto: current.correo_contacto,
            telefono: current.telefono,
            ...parsed.data,
        };

        const result = await service.update(id, updates, user);

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}
