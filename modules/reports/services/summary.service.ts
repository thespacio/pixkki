import { getReportsAccess } from "../access";
import type { DashboardSummaryDTO, DashboardSummaryQueryDTO } from "../dtos/summary.dto";
import {
    PeriodoInvalidoReportesError,
    RangoExcedidoReportesError,
} from "../errors";
import type { SummaryReportRepository } from "../repositories/summary.repository";
import { dashboardSummaryQuerySchema } from "../validators/summary.validators";

import type { AuthenticatedUser } from "@/modules/auth/types";

const ZONA_HORARIA = "America/Mexico_City";

function fechaHoyEnZonaHoraria(): string {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_HORARIA,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const valor = (tipo: string): string =>
        partes.find((parte) => parte.type === tipo)?.value ?? "";

    return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/** RF7.5: el resumen usa el mes calendario en curso por defecto. */
export class SummaryReportService {
    constructor(private readonly repository: SummaryReportRepository) {}

    async getDashboardSummary(
        query: DashboardSummaryQueryDTO,
        user: AuthenticatedUser,
    ): Promise<DashboardSummaryDTO> {
        const access = getReportsAccess(user);

        const parsed = dashboardSummaryQuerySchema.safeParse(query);
        if (!parsed.success) {
            const mensaje = parsed.error.issues[0]?.message ?? "El periodo no es válido.";
            if (mensaje.includes("366")) {
                throw new RangoExcedidoReportesError(mensaje);
            }
            throw new PeriodoInvalidoReportesError(mensaje);
        }

        const hoy = fechaHoyEnZonaHoraria();
        const desde = parsed.data.desde ?? `${hoy.slice(0, 7)}-01`;
        const hasta = parsed.data.hasta ?? hoy;

        return this.repository.getResumen(access.idRefugio, desde, hasta);
    }
}
