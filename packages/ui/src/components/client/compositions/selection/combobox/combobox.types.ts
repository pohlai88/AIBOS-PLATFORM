/**
 * Combobox Types - Layer 2 Composition
 * @module ComboboxTypes
 * @layer 2
 */

export type ComboboxSize = 'sm' | 'md' | 'lg'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  size?: ComboboxSize
  disabled?: boolean
  className?: string
  testId?: string
}

