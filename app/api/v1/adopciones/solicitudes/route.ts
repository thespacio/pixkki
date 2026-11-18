import type { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api/responses";
import { getCurrentUser } from "@/modules/auth";
import { createApplicationService } from "@/modules/adoptions/factories/create-application-service";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        const query = Object.fromEntries(request.nextUrl.searchParams.entries());
        const service = await createApplicationService();
        const result = await service.list(query, user);
        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}