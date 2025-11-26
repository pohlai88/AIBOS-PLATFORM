/**
 * CommandPalette Types - Layer 2 Composition
 * @module CommandPaletteTypes
 * @layer 2
 */

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string[]
  onSelect?: () => void
  disabled?: boolean
}

export interface CommandGroup {
  heading: string
  items: CommandItem[]
}

export interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  emptyMessage?: string
  groups?: CommandGroup[]
  items?: CommandItem[]
  testId?: string
  className?: string
  children?: React.ReactNode
}

export interface CommandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CommandEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  onSelect?: () => void
}

export interface CommandSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface CommandShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

