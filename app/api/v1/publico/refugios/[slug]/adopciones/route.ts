import type { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";

type RouteContext = { params: { slug: string } };

export async function GET(request: NextRequest, { params }: RouteContext) {
    try {
        const query = Object.fromEntries(request.nextUrl.searchParams.entries());
        const service = await createPublicCatalogService();
        const result = await service.listByRefugio(params.slug, query);
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}