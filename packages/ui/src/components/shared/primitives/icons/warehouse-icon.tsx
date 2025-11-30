/**
 * WarehouseIcon - Custom ERP Module Icon
 *
 * Custom icon for Warehouse/Inventory module in AI-BOS ERP system.
 * Follows Heroicons pattern for consistency.
 *
 * @component Custom ERP icon
 * @version 1.0.0
 * @mcp-validated true
 */

import * as React from "react";

export interface WarehouseIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * WarehouseIcon - Custom icon for Warehouse/Inventory module
 *
 * Features:
 * - RSC-compatible (no 'use client' needed)
 * - Works with IconWrapper for consistent sizing
 * - Theme-aware (uses currentColor for coloring)
 * - Accessible (can be wrapped with IconWrapper for aria-label)
 *
 * @example
 * ```tsx
 * import { WarehouseIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * // Basic usage
 * <IconWrapper>
 *   <WarehouseIcon />
 * </IconWrapper>
 *
 * // With custom size
 * <IconWrapper size="lg">
 *   <WarehouseIcon />
 * </IconWrapper>
 *
 * // In navigation
 * <NavigationMenu
 *   items={[
 *     { label: 'Warehouse', href: '/warehouse', icon: <WarehouseIcon /> }
 *   ]}
 * />
 * ```
 */
export const WarehouseIcon = React.forwardRef<SVGSVGElement, WarehouseIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Warehouse building with boxes - Inventory/Warehouse theme */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 3.75l-1.5.545M18.75 3.75l-1.5-.545M12.75 19.5v-.75A.75.75 0 0114 18h1.5a.75.75 0 01.75.75v.75m-4.5-.75v-.75a.75.75 0 00-.75-.75H9a.75.75 0 00-.75.75v.75m15 0h-2.25m-13.5 0H3.375"
        />
        {/* Boxes/Inventory items */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.5h2.25v-2.25H3v2.25zm0 4.5h2.25v-2.25H3v2.25zm3.75-4.5h2.25v-2.25H6.75v2.25zm0 4.5h2.25v-2.25H6.75v2.25zm3.75-4.5h2.25v-2.25H10.5v2.25zm0 4.5h2.25v-2.25H10.5v2.25zm3.75-4.5h2.25v-2.25H14.25v2.25zm0 4.5h2.25v-2.25H14.25v2.25z"
          opacity={0.4}
        />
      </svg>
    );
  }
);

WarehouseIcon.displayName = "WarehouseIcon";

