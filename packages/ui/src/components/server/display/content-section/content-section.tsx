/**
 * ContentSection - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { ContentSectionProps } from './content-section.types'
import { cn } from '../../../../design/utilities/cn'

const spacings = {
  sm: 'py-6',
  md: 'py-10',
  lg: 'py-16',
}

const headingSizes = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-bold',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
}

/**
 * ContentSection - Server-rendered content block with heading
 *
 * @example
 * ```tsx
 * <ContentSection title="Features" subtitle="What we offer">
 *   <FeatureGrid />
 * </ContentSection>
 * ```
 */
export async function ContentSection({
  title,
  subtitle,
  headingLevel = 'h2',
  children,
  className,
  spacing = 'md',
  ...props
}: ContentSectionProps) {
  const Heading = headingLevel

  return (
    <section
      className={cn('mcp-server-safe', spacings[spacing], className)}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <Heading className={headingSizes[headingLevel]}>{title}</Heading>}
          {subtitle && (
            <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

export default ContentSection

