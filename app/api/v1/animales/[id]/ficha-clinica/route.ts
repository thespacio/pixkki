// app/api/v1/animales/[id]/ficha-clinica/route.ts

import type { NextRequest } from "next/server";
import { createClinicalRecordService } from "@/modules/animals/factories/create-clinical-record-service";
import { getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { parseRouteId, requireAnimalUser } from "../../route-helpers";

type RouteContext = { params: { id: string } };

/**
 * RF1.4: ficha clínica consolidada del expediente (US08).
 * Solo lectura: animal, imágenes, diagnósticos, alertas y línea de tiempo.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await requireAnimalUser();
        const service = await createClinicalRecordService();
        const ficha = await service.getClinicalRecord(
            parseRouteId(params.id, "Animal"),
            getAnimalAccess(user),
        );

        return apiSuccess(ficha);
    } catch (error) {
        return handleApiError(error);
    }
}
