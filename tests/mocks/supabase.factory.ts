import { mockSupabaseClient } from "./supabase.client.mock";

export function createSupabaseMock(overrides?: any) {
  return {
    ...mockSupabaseClient,
    ...overrides,
  };
}