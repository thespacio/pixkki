import { describe, it, expect } from "vitest";
import { createSupabaseMock } from "../../mocks/supabase.factory";

describe("auth flow", () => {
  it("should return user when login succeeds", async () => {
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