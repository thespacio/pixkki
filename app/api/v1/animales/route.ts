// app/api/v1/animales/route.ts

import type { NextRequest } from "next/server";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import { CreateAnimalSchema } from "@/modules/animals/validators/animal.validators";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { requireAnimalUser } from "./route-helpers";

/** RF1.1: alta de paciente y generación de expediente clínico (US05). */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAnimalUser(
            ANIMAL_PERMISSIONS.create,
            "registrar animales",
        );

        const parsed = CreateAnimalSchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);

        const service = await createAnimalService();
        const animal = await service.create(parsed.data, getAnimalAccess(user));

        return apiSuccess(animal, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

/** RF1.1: listado de pacientes visibles para el refugio en sesión. */
export async function GET(request: NextRequest) {
    try {
        const user = await requireAnimalUser();
        const service = await createAnimalService();
        const animales = await service.listVisible(getAnimalAccess(user));

        const page = Math.max(readPositiveInt(request.nextUrl.searchParams.get("page"), 1), 1);
        const pageSize = Math.min(
            Math.max(readPositiveInt(request.nextUrl.searchParams.get("pageSize"), 20), 1),
            100,
        );
        const start = (page - 1) * pageSize;

        return apiSuccess({
            animales: animales.slice(start, start + pageSize),
            total: animales.length,
            page,
            pageSize,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

function readPositiveInt(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
