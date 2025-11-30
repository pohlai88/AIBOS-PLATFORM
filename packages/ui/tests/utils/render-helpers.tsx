/**
 * Test render helpers for UI components
 * 
 * Provides utilities for rendering components with theme providers,
 * making it easy to test components in isolation with proper context.
 */

import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

/**
 * Render component with mock theme wrapper
 * 
 * Uses a simple div wrapper with data-theme attribute instead of full ThemeProvider
 * to avoid async loading issues in tests
 * 
 * @param ui - React element to render
 * @param options - Additional render options
 * @returns Render result with theme context
 * 
 * @example
 * ```tsx
 * const { container } = renderWithTheme(<Button>Click me</Button>);
 * expect(container).toBeInTheDocument();
 * ```
 */
export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <div data-theme="light" className="test-theme-wrapper">
        {children}
      </div>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Render component with mock theme (light theme)
 * 
 * Useful for testing components without full theme provider overhead
 * 
 * @param ui - React element to render
 * @param theme - Theme variant to apply
 * @param options - Additional render options
 * @returns Render result with mock theme
 * 
 * @example
 * ```tsx
 * const { container } = renderWithMockTheme(
 *   <Button>Click me</Button>,
 *   "dark"
 * );
 * ```
 */
export function renderWithMockTheme(
  ui: ReactElement,
  theme: "light" | "dark" | "wcag-aa" | "wcag-aaa" = "light",
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <div data-theme={theme} className="theme-wrapper">
        {children}
      </div>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Re-export render from @testing-library/react for convenience
 */
export { render, screen, waitFor, within } from "@testing-library/react";

