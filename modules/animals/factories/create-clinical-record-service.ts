
import { ClinicalRecordRepository } from "../repositories/clinical-record.repository";
import { ClinicalRecordService } from "../services/clinical-record.service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function createClinicalRecordService(): Promise<ClinicalRecordService> {
    const supabase = await createSupabaseServerClient();
    const repository = new ClinicalRecordRepository(supabase);
    return new ClinicalRecordService(repository);
}