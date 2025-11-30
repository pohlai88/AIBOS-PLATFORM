/**
 * Navigation - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { NavigationProps } from './navigation.types'
import { cn } from '../../../../design/utilities/cn'

const variants = {
  default: '',
  pills: 'gap-1',
  underline: 'border-b border-border',
}

const itemVariants = {
  default: 'px-3 py-2 text-sm text-muted-foreground hover:text-foreground',
  pills: 'px-3 py-1.5 text-sm rounded-md',
  underline: 'px-3 py-2 text-sm border-b-2 border-transparent -mb-px',
}

/**
 * Navigation - Server-rendered navigation component
 *
 * @example
 * ```tsx
 * <Navigation
 *   items={[
 *     { label: 'Home', href: '/', active: true },
 *     { label: 'About', href: '/about' },
 *   ]}
 * />
 * ```
 */
export async function Navigation({
  items = [],
  children,
  className,
  orientation = 'horizontal',
  variant = 'default',
  ...props
}: NavigationProps) {
  return (
    <nav
      className={cn(
        'mcp-server-safe',
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
        variants[variant],
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className={cn(
            itemVariants[variant],
            item.active && 'text-foreground font-medium',
            item.active && variant === 'pills' && 'bg-muted',
            item.active && variant === 'underline' && 'border-primary',
            item.disabled && 'opacity-50 pointer-events-none'
          )}
          aria-current={item.active ? 'page' : undefined}
          aria-disabled={item.disabled}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </a>
      ))}
      {children}
    </nav>
  )
}

export default Navigation

