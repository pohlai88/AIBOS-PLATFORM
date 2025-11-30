/**
 * Theme provider mocks for testing
 * 
 * Provides mock implementations of theme providers for isolated testing
 */

import { ReactNode } from "react";

/**
 * Mock theme provider that applies theme via data attribute
 * 
 * @param children - React children
 * @param theme - Theme variant
 * @returns Mock theme wrapper
 */
export function MockThemeProvider({
  children,
  theme = "light",
}: {
  children: ReactNode;
  theme?: "light" | "dark" | "wcag-aa" | "wcag-aaa";
}) {
  return (
    <div data-theme={theme} className="mock-theme-provider">
      {children}
    </div>
  );
}

