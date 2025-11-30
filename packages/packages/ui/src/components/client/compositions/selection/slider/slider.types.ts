/**
 * Slider Types - Layer 2 Radix Composition
 * @module SliderTypes
 * @layer 2
 */

import type * as SliderPrimitive from '@radix-ui/react-slider'

export type SliderSize = 'sm' | 'md' | 'lg'
export type SliderVariant = 'default' | 'primary' | 'success'

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  size?: SliderSize
  variant?: SliderVariant
  testId?: string
}

