/**
 * Header - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { HeaderProps } from "./header.types";
import { cn } from "../../../../design/utilities/cn";

const variants = {
  default: "bg-surface border-b border-border",
  transparent: "bg-transparent",
  elevated: "bg-surface shadow-md",
};

/**
 * Header - Server-rendered page header component
 *
 * @example
 * ```tsx
 * <Header
 *   logo={<Logo />}
 *   navigation={<Nav />}
 *   actions={<UserMenu />}
 * />
 * ```
 */
export async function Header({
  logo,
  navigation,
  actions,
  children,
  className,
  variant = "default",
  sticky = false,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "mcp-server-safe",
        "w-full px-4 py-3",
        variants[variant],
        sticky && "sticky top-0 z-50",
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {logo && <div className="flex-shrink-0">{logo}</div>}
        {navigation && <nav className="flex-1 mx-6">{navigation}</nav>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {children}
      </div>
    </header>
  );
}

export default Header;
