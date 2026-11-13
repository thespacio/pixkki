// app/api/v1/animales/[id]/diagnosticos/route.ts

import type { NextRequest } from "next/server";
import { createAnimalDiagnosisService } from "@/modules/animals/factories/create-animal-diagnosis-service";
import { CreateDiagnosticoBodySchema } from "@/modules/animals/validators/animal.validators";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

/** RF1.3: historial de diagnósticos veterinarios del expediente (US07). */
export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalDiagnosisService();
        const diagnosticos = await service.listDiagnoses(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );

        return apiSuccess({ diagnosticos });
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * RF1.3: registra el diagnóstico veterinario de ingreso (US07).
 * El animal sale del path y el veterinario de la sesión: nunca del cliente.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const parsed = CreateDiagnosticoBodySchema.safeParse(
            await readJsonBody(request),
        );

        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalDiagnosisService();
        const diagnostico = await service.createDiagnosis(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
            parsed.data,
            { id: user.id, role: user.role },
        );

        return apiSuccess({ diagnostico }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
