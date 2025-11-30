/**
 * Layer 2: Radix Compositions
 *
 * Client-side interactive components built on Radix UI primitives.
 * These components integrate Layer 1 Typography and design tokens.
 *
 * Architecture:
 * - All components use 'use client' directive
 * - Radix UI provides accessibility and behavior
 * - Design tokens provide visual consistency
 * - Layer 1 Typography provides text rendering
 *
 * Categories (per SSOT):
 * - overlay: Dialog, Popover, Tooltip, Drawer, HoverCard, AlertDialog
 * - navigation: DropdownMenu, Tabs, Accordion, ContextMenu, Menubar
 * - selection: Select, Combobox, ToggleGroup, Switch, Checkbox, RadioGroup
 * - feedback: Toast, Alert, Progress, Skeleton
 *
 * @module compositions
 * @layer 2
 */

// ============================================================================
// Overlay Components
// ============================================================================
export * from './overlay'

// ============================================================================
// Navigation Components
// ============================================================================
export * from './navigation'

// ============================================================================
// Selection Components
// ============================================================================
export * from './selection'

// ============================================================================
// Feedback Components
// ============================================================================
export * from './feedback'
