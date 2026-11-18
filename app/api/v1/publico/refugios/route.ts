import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";

export async function GET() {
    try {
        const service = await createPublicCatalogService();
        const result = await service.listRefugios();
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}