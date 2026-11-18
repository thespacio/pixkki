import type { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { parseRouteId } from "@/lib/api/request";

type RouteContext = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const service = await createPublicCatalogService();
        const result = await service.getAnimal(parseRouteId(params.id, "Animal"));
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}