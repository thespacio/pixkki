import type { NextRequest } from "next/server";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { parseRouteId } from "@/lib/api/request";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { CreateSolicitudPublicaBodySchema } from "@/modules/adoptions/validators/application.validators";

type RouteContext = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const parsed = CreateSolicitudPublicaBodySchema.safeParse(await readJsonBody(request));
        if (!parsed.success) return apiValidationError(parsed.error);
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const service = await createPublicCatalogService();
        const result = await service.submitApplication(parseRouteId(params.id, "Animal"), parsed.data, ip);
        return apiSuccess(result, 201);
    } catch (error) {
        return handleApiError(error);
    }
}