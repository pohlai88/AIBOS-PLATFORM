/**
 * @aibos/ui - Component Library
 *
 * React 19 RSC + Next.js 16 App Router Architecture
 *
 * Import Patterns:
 * - Server Components: import { Header } from '@aibos/ui/server'
 * - Client Components: import { Dialog } from '@aibos/ui/client'
 * - Shared Primitives: import { Button } from '@aibos/ui/shared'
 *
 * @version 2.0.0
 * @mcp-certified true
 */

// Server Components (RSC - no client JS)
export * from './server'

// Shared Components (work in both environments)
export * from './shared'

// Client Components - namespaced to avoid conflicts
export * as Client from './client'

// Design utilities
export { cn } from '../design/utilities/cn'
