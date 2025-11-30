/**
 * Sidebar - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { SidebarProps } from './sidebar.types'
import { cn } from '../../../../design/utilities/cn'

const widths = {
  sm: 'w-48',
  md: 'w-64',
  lg: 'w-80',
}

/**
 * Sidebar - Server-rendered sidebar component
 *
 * @example
 * ```tsx
 * <Sidebar header={<Logo />} width="md">
 *   <Navigation items={items} orientation="vertical" />
 * </Sidebar>
 * ```
 */
export async function Sidebar({
  header,
  footer,
  children,
  className,
  position = 'left',
  width = 'md',
  collapsed = false,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'mcp-server-safe',
        'flex flex-col h-full bg-surface border-border',
        position === 'left' ? 'border-r' : 'border-l',
        collapsed ? 'w-16' : widths[width],
        'transition-[width] duration-200',
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      data-collapsed={collapsed}
      {...props}
    >
      {header && (
        <div className="flex-shrink-0 p-4 border-b border-border">{header}</div>
      )}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
      {footer && (
        <div className="flex-shrink-0 p-4 border-t border-border">{footer}</div>
      )}
    </aside>
  )
}

export default Sidebar

