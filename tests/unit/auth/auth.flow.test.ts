import { describe, it, expect } from "vitest";
import { createSupabaseMock } from "../../mocks/supabase.factory";
import { qaAnnotate } from "../../utils/qa";

describe("auth flow", () => {
  it("should return user when login succeeds", async (ctx) => {
    await qaAnnotate(ctx, {
      id: "TC-U01",
      categoria: "Unitaria",
      criterio: "El mock de Supabase Auth devuelve el usuario esperado cuando signInWithPassword resuelve con éxito.",
      prioridad: "Media",
    });

    const supabase = createSupabaseMock();

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    const result = await supabase.auth.signInWithPassword({
      email: "test@test.com",
      password: "123",
    });

    expect(result.data.user.id).toBe("123");
  });
});