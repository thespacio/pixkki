import { vi } from "vitest";

// Mock Supabase JS
vi.mock("@supabase/supabase-js", async () => {
  const actual = await vi.importActual<any>("@supabase/supabase-js");
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

// Mock Supabase SSR
vi.mock("@supabase/ssr", () => {
  return {
    createServerClient: vi.fn(),
  };
});