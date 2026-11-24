import { z } from "zod";

import {
    dashboardSummaryQuerySchema,
    dashboardSummarySchema,
} from "../validators/summary.validators";

/** RF7.5: todos los DTOs se derivan del schema Zod, sin tipos duplicados. */
export type DashboardSummaryQueryDTO = z.infer<typeof dashboardSummaryQuerySchema>;
export type DashboardSummaryDTO = z.infer<typeof dashboardSummarySchema>;
