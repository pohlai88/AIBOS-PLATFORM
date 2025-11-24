import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Root ESLint configuration for the entire monorepo
 * 
 * This single config file handles all packages:
 * - Next.js apps: Use Next.js-specific rules
 * - Regular packages: Use base TypeScript rules
 */
export default defineConfig([
  // Next.js apps configuration
  {
    files: ["apps/**/*.{js,jsx,ts,tsx}"],
    ...nextVitals[0],
    ...nextTs[0],
    settings: {
      next: {
        rootDir: "./",
      },
    },
  },
  // Base configuration for packages (ui, utils, types, etc.)
  {
    files: ["packages/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  // Global ignores for all files
  globalIgnores([
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "out/**",
    "*.config.js",
    "*.config.mjs",
    "*.config.ts",
    "next-env.d.ts",
  ]),
]);
