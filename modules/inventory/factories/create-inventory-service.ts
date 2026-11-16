import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { InventoryRepository } from "../repositories/inventory.repository";
import { InventoryService } from "../services/inventory.service";

export async function createInventoryService(): Promise<InventoryService> {
    const supabase = await createSupabaseServerClient();
    const repository = new InventoryRepository(supabase);
    return new InventoryService(repository);
}
