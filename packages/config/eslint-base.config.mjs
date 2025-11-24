import { defineConfig, globalIgnores } from "eslint/config";

/**
 * Base ESLint configuration for all packages
 * Extend this for non-Next.js packages (utils, types, etc.)
 */
export const baseConfig = defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
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
      // Base rules for all packages
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  globalIgnores([
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "out/**",
    "*.config.js",
    "*.config.mjs",
    "*.config.ts",
  ]),
]);

export default baseConfig;
