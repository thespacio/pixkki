import type { DashboardSummaryDTO } from "@/modules/reports/dtos/summary.dto";

/**
 * Contrato de solo lectura que consume el panel.
 * El dashboard no calcula indicadores: delega en `modules/reports`.
 */
export type DashboardSummaryPort = {
    getResumen(): Promise<DashboardSummaryDTO>;
};
