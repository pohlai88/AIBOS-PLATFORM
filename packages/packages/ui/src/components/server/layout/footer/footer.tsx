/**
 * Footer - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { FooterProps } from './footer.types'
import { cn } from '../../../../design/utilities/cn'

const variants = {
  default: 'py-6',
  minimal: 'py-4',
  expanded: 'py-12',
}

/**
 * Footer - Server-rendered page footer component
 *
 * @example
 * ```tsx
 * <Footer
 *   copyright="© 2025 AI-BOS"
 *   links={[
 *     { label: 'Privacy', href: '/privacy' },
 *     { label: 'Terms', href: '/terms' },
 *   ]}
 * />
 * ```
 */
export async function Footer({
  copyright,
  links = [],
  left,
  right,
  children,
  className,
  variant = 'default',
  ...props
}: FooterProps) {
  return (
    <footer
      className={cn(
        'mcp-server-safe',
        'w-full bg-surface border-t border-border',
        variants[variant],
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4">
        {children || (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {left}
              {copyright && (
                <span className="text-sm text-muted-foreground">{copyright}</span>
              )}
            </div>
            {links.length > 0 && (
              <nav className="flex items-center gap-4">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            {right && <div>{right}</div>}
          </div>
        )}
      </div>
    </footer>
  )
}

export default Footer

