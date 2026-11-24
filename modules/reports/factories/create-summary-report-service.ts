import { createSupabaseServerClient } from "@/lib/supabase/server-client";

import { SummaryReportRepository } from "../repositories/summary.repository";
import { SummaryReportService } from "../services/summary.service";

export async function createSummaryReportService(): Promise<SummaryReportService> {
    const supabase = await createSupabaseServerClient();
    const repository = new SummaryReportRepository(supabase);
    return new SummaryReportService(repository);
}
