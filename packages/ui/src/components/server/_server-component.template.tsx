/**
 * SERVER COMPONENT TEMPLATE - React 19 RSC Compliant
 *
 * Environment: Server-Side Only (NO 'use client' directive)
 * React Version: 19.x RSC Architecture
 * Next.js: 16.0.3 App Router
 * MCP Validation: 6-point validation required
 *
 * @template Use this template for all server-side components
 * @version 1.0.0 - React 19 RSC Compliant
 * @mcp-validated pending
 */

// ❌ NO 'use client' directive - Server Component by default

import type { ReactNode, CSSProperties } from 'react'
import { cn } from '../../design/utilities/cn'

// ============================================================================
// STEP 1: RSC-Safe Props Type (React 19 Requirement)
// ============================================================================

/**
 * RSC-Safe Props - No event handlers allowed (React 19 requirement)
 * Server Components cannot accept functions as props
 *
 * ❌ NO onClick, onMouseEnter, onChange, onSubmit, etc.
 * ❌ NO functions, class instances, Symbols
 * ✅ Only serializable values allowed
 */
type ServerElementProps = {
  id?: string
  role?: string
  title?: string
  tabIndex?: number
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-hidden'?: boolean
  'data-testid'?: string
}

// ============================================================================
// STEP 2: Component Props Interface
// ============================================================================

export interface ServerComponentProps extends ServerElementProps {
  /** Child content - must be serializable */
  children?: ReactNode
  /** Component variant */
  variant?: 'default' | 'primary' | 'secondary'
  /** Component size */
  size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// STEP 3: Variant Styles (Design Token Based)
// ============================================================================

const variants = {
  default: 'bg-surface text-foreground border border-border',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
}

const sizes = {
  sm: 'p-2 text-sm rounded-sm',
  md: 'p-4 text-base rounded-md',
  lg: 'p-6 text-lg rounded-lg',
}

// ============================================================================
// STEP 4: Server Component Implementation
// ============================================================================

/**
 * ServerComponent - React 19 RSC Compliant Server Component
 *
 * Features:
 * - Zero client-side JavaScript
 * - Server-side rendering only
 * - Async data fetching support
 * - RSC-safe props (no event handlers)
 * - Design token compliant
 * - MCP validated
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ServerComponent variant="primary" size="md">
 *   Static content here
 * </ServerComponent>
 *
 * // With async data
 * export default async function Page() {
 *   const data = await fetchData()
 *   return (
 *     <ServerComponent>
 *       {data.title}
 *     </ServerComponent>
 *   )
 * }
 * ```
 */
export async function ServerComponent({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ServerComponentProps) {
  // ✅ Server-side logic only - no hooks, no browser APIs

  return (
    <div
      className={cn(
        // Base styles
        'mcp-server-safe',
        // Variant styles
        variants[variant],
        // Size styles
        sizes[size],
        // Custom classes
        className
      )}
      // MCP validation markers
      data-mcp-validated="true"
      data-server-component="true"
      data-constitution-compliant="server-component"
      {...props}
    >
      {children}
    </div>
  )
}

// Default export for Next.js
export default ServerComponent

// ============================================================================
// STEP 5: Server Component Compliance Checklist
// ============================================================================
/*
 * ✅ NO 'use client' directive
 * ✅ NO React hooks (useState, useEffect, useCallback, etc.)
 * ✅ NO browser APIs (window, localStorage, document, etc.)
 * ✅ NO event handlers (onClick, onChange, etc.)
 * ✅ Props are fully serializable (RSC-safe)
 * ✅ Uses async function pattern
 * ✅ Design tokens used exclusively
 * ✅ MCP server validation markers included
 * ✅ TypeScript strict mode compatible
 */

// ============================================================================
// STEP 6: MCP Validation Requirements (6 checks)
// ============================================================================
/*
 * 1. validate_rsc_boundary - No 'use client' directive
 * 2. check_server_client_usage - No client imports
 * 3. validate_imports - No browser APIs
 * 4. validate_server_safe_imports - Only server-safe imports
 * 5. validate_props_serializability - No function props
 * 6. validate_react_component - Component quality
 */

