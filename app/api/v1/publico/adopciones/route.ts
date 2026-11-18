import type { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";

export async function GET(request: NextRequest) {
    try {
        const params = Object.fromEntries(request.nextUrl.searchParams.entries());
        const service = await createPublicCatalogService();
        const result = await service.listCatalog(params);
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}