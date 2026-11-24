import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

import type { DashboardSummaryDTO } from "../dtos/summary.dto";
import { ErrorInternoReportesError } from "../errors";
import { dashboardSummarySchema } from "../validators/summary.validators";

/**
 * Único punto de acceso a la RPC `reporte_resumen`.
 * No calcula indicadores: PostgreSQL los agrega respetando RLS y el tenant.
 */
export class SummaryReportRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async getResumen(
        idRefugio: number | null,
        desde: string,
        hasta: string,
    ): Promise<DashboardSummaryDTO> {
        const { data, error } = await this.supabase.rpc("reporte_resumen", {
            p_desde: desde,
            p_hasta: hasta,
            // El generador de tipos no modela la nulabilidad de los argumentos
            // SQL: omitir el tenant activa el `default null` de la RPC, que es
            // el agregado global autorizado solo para superadmin.
            ...(idRefugio === null ? {} : { p_id_refugio: idRefugio }),
        });

        if (error) {
            throw new ErrorInternoReportesError();
        }

        const parsed = dashboardSummarySchema.safeParse(data);
        if (!parsed.success) {
            throw new ErrorInternoReportesError();
        }

        return parsed.data;
    }
}
