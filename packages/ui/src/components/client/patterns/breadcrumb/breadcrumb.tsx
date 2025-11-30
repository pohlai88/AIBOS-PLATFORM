/**
 * Breadcrumb Component - Layer 3 Complex Pattern
 *
 * Navigation breadcrumb component for showing hierarchical paths.
 * Composes the primitive Breadcrumb with client-side enhancements.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Breadcrumb } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Breadcrumb
 *       items={[
 *         { label: 'Home', href: '/' },
 *         { label: 'Products', href: '/products' },
 *         { label: 'Current Page' },
 *       ]}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import primitive Breadcrumb
import { Breadcrumb as BreadcrumbPrimitive } from "../../../shared/primitives/breadcrumb";
import type { BreadcrumbItem as PrimitiveBreadcrumbItem } from "../../../shared/primitives/breadcrumb";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { BreadcrumbProps, BreadcrumbItem } from "./breadcrumb.types";

/**
 * Breadcrumb - Navigation breadcrumb component
 *
 * Features:
 * - Hierarchical path navigation
 * - Automatic truncation for long paths
 * - Custom separators
 * - Icon support per item
 * - Home icon option
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = "/",
      maxItems,
      showHome = false,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // Convert Layer 3 items to primitive items format
    const primitiveItems: PrimitiveBreadcrumbItem[] = React.useMemo(() => {
      return items.map((item) => ({
        label: item.label,
        href: item.href,
        icon: item.icon,
      }));
    }, [items]);

    return (
      <BreadcrumbPrimitive
        ref={ref}
        items={primitiveItems}
        separator={separator}
        maxItems={maxItems}
        showHome={showHome}
        className={cn("mcp-layer3-pattern", className)}
        testId={testId}
        {...props}
      />
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

