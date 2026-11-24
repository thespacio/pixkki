// app/api/v1/reportes/resumen/route.ts
// RF7.5. Contrato HTTP del resumen operativo. La autorización vive en el
// service de reports; aquí solo se valida la entrada y se traduce el resultado.
import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/modules/auth";
import { createSummaryReportService } from "@/modules/reports/factories/create-summary-report-service";
import { dashboardSummaryQuerySchema } from "@/modules/reports/validators/summary.validators";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const parsed = dashboardSummaryQuerySchema.safeParse({
            desde: request.nextUrl.searchParams.get("desde") ?? undefined,
            hasta: request.nextUrl.searchParams.get("hasta") ?? undefined,
        });
        if (!parsed.success) return apiValidationError(parsed.error);

        const user = await getCurrentUser();
        const service = await createSummaryReportService();
        const resumen = await service.getDashboardSummary(parsed.data, user);

        const response = apiSuccess(resumen);
        response.headers.set("Cache-Control", "private, max-age=60");
        return response;
    } catch (error) {
        return handleApiError(error);
    }
}
