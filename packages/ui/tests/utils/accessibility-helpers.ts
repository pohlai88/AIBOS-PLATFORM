/**
 * Accessibility testing helpers
 * 
 * Provides utilities for testing WCAG compliance using jest-axe
 */

import { axe, toHaveNoViolations } from "jest-axe";
import { expect } from "vitest";

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * Test component for accessibility violations
 * 
 * @param container - DOM container element
 * @returns Promise that resolves when accessibility check completes
 * 
 * @example
 * ```tsx
 * const { container } = renderWithTheme(<Button>Click me</Button>);
 * await expectAccessible(container);
 * ```
 */
export async function expectAccessible(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

/**
 * Test component for accessibility with custom options
 * 
 * @param container - DOM container element
 * @param options - Axe configuration options
 * @returns Promise that resolves when accessibility check completes
 * 
 * @example
 * ```tsx
 * await expectAccessibleWithOptions(container, {
 *   rules: { "color-contrast": { enabled: false } }
 * });
 * ```
 */
export async function expectAccessibleWithOptions(
  container: HTMLElement,
  options?: Parameters<typeof axe>[1]
) {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
}

