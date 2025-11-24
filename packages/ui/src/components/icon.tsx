// packages/ui/src/components/icon.tsx
// Heroicons v2 wrapper component
import * as React from "react";

// Heroicons v2 types
export type HeroIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & {
    title?: string;
    titleId?: string;
  }
>;

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  /**
   * Heroicon component from @heroicons/react/24/outline or @heroicons/react/24/solid
   * Example: import { HomeIcon } from '@heroicons/react/24/outline'
   */
  icon: HeroIcon;
  /**
   * Size preset (maps to Tailwind classes)
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Additional className for custom styling
   */
  className?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

/**
 * Icon component wrapper for Heroicons v2
 *
 * @example
 * ```tsx
 * import { HomeIcon } from '@heroicons/react/24/outline'
 * import { Icon } from '@aibos/ui'
 *
 * <Icon icon={HomeIcon} size="md" />
 * ```
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = "md", className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={[sizeMap[size], className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";
