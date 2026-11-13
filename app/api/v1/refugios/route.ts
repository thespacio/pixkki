// app/api/v1/refugios/route.ts
//
// API v1 de refugios (requerimiento-00, RF0.1/RF0.2):
//   GET  /api/v1/refugios  — listado con alcance de tenant.
//   POST /api/v1/refugios  — alta de refugio + su administrador (superadmin).

import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/modules/auth";
import {
    createCreateShelterWithAdminUseCase,
    createShelterService,
} from "@/modules/shelters/factories";
import { ShelterAuthorization } from "@/modules/shelters/authorization";
import { CreateShelterSchema } from "@/modules/shelters/schemas";
import type { ShelterQueryParams } from "@/modules/shelters/types";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import {
    readBooleanParam,
    readJsonBody,
    readNonNegativeIntParam,
    readPositiveIntParam,
} from "@/lib/api/request";

/** Listado de refugios visibles para el usuario en sesión. */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        const params = request.nextUrl.searchParams;

        const filters: ShelterQueryParams = {
            ciudad: params.get("ciudad") ?? undefined,
            estado: params.get("estado") ?? undefined,
            activo: readBooleanParam(params.get("activo")),
            search: params.get("search") ?? undefined,
            limit: Math.min(readPositiveIntParam(params.get("limit")) ?? 20, 100),
            offset: readNonNegativeIntParam(params.get("offset"), 0),
        };

        const service = await createShelterService();
        const result = await service.findAll(filters, user);

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}

/** Alta de refugio con su administrador. Exclusivo del superadmin. */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        ShelterAuthorization.ensureCanCreate(user);

        const parsed = CreateShelterSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const useCase = await createCreateShelterWithAdminUseCase();
        const result = await useCase.execute({ shelter: parsed.data });

        return apiSuccess(result, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
