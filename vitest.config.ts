import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mismo alias "@/..." que usa el proyecto (tsconfig paths), para poder
    // importar módulos reales en los tests.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup/vitest.setup.ts",
    css: false,
    reporters: ["default", "./tests/reporters/qa-vitest-reporter.ts"],
  },
});