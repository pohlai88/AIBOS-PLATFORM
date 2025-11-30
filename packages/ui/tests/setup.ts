/**
 * Global test setup file for Vitest
 * 
 * This file configures the testing environment with:
 * - DOM matchers from @testing-library/jest-dom
 * - Accessibility testing setup
 * - Global test utilities
 */

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom/vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Suppress console errors in tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   error: vi.fn(),
//   warn: vi.fn(),
// };

