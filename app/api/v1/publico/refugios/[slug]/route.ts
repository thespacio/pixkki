import type { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";

type RouteContext = { params: { slug: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const service = await createPublicCatalogService();
        const result = await service.getRefugio(params.slug);
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}