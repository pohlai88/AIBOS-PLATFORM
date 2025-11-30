import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.test.tsx",
        "**/*.test.ts",
        "**/*.config.ts",
        "**/coverage/",
        "**/dist/",
        "**/.next/",
        "**/__tests__/",
        "**/*.examples.tsx",
        "**/constitution/",
        "**/mcp/**/*.mcp.json",
      ],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/design": path.resolve(__dirname, "./src/design"),
      "@/mcp": path.resolve(__dirname, "./mcp"),
    },
  },
});

