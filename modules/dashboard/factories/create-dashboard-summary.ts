import { getCurrentUser } from "@/modules/auth";
import { createSummaryReportService } from "@/modules/reports/factories/create-summary-report-service";

import type { DashboardSummaryPort } from "../services/summary.port";

/**
 * Ensambla el resumen del panel con el usuario de la sesión.
 * El periodo por defecto se resuelve en el service de reports (RF7.5).
 */
export async function createDashboardSummary(): Promise<DashboardSummaryPort> {
    const [user, reportsService] = await Promise.all([
        getCurrentUser(),
        createSummaryReportService(),
    ]);

    return {
        getResumen: () => reportsService.getDashboardSummary({}, user),
    };
}
