import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup/vitest.setup.ts",
    css: false,
  },
});