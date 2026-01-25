import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/scripts/terminal/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/scripts": resolve(__dirname, "./src/scripts"),
    },
  },
});
