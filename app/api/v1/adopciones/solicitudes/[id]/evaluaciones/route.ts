import type { NextRequest } from "next/server";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody, parseRouteId } from "@/lib/api/request";
import { getCurrentUser } from "@/modules/auth";
import { createEvaluationService } from "@/modules/adoptions/factories/create-evaluation-service";
import { CreateEvaluacionBodySchema } from "@/modules/adoptions/validators/evaluation.validators";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const service = await createEvaluationService();
        const result = await service.list(parseRouteId(params.id, "Solicitud"), user);
        return apiSuccess({ evaluaciones: result });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const user = await getCurrentUser();
        const parsed = CreateEvaluacionBodySchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);
        const service = await createEvaluationService();
        const result = await service.create(parseRouteId(params.id, "Solicitud"), parsed.data, user);
        return apiSuccess(result, 201);
    } catch (error) {
        return handleApiError(error);
    }
}