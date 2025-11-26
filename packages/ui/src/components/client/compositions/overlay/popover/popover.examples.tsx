/**
 * Popover Component Examples
 * Demonstrates various usage patterns and configurations of the Popover composition component.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-popover
 * @category Client Components
 * @example
 * import { BasicPopoverExample } from '@aibos/ui/compositions/popover/examples';
 *
 * export default function Page() {
 *   return <BasicPopoverExample />;
 * }
 */

'use client'

import React from 'react'
import { Text } from '../../../../shared/typography/text'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './popover'

/**
 * Example 1: Basic Popover
 * Simple popover with default settings
 */
export function BasicPopoverExample() {
  return (
    <div className="p-8">
      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Open Popover
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-2">
            <Text size="sm" weight="medium">
              Popover Title
            </Text>
            <Text size="sm" color="muted">
              This is a basic popover with default settings. It appears on top
              of the trigger by default.
            </Text>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Example 2: Size Variants
 * Demonstrates all available size variants
 */
export function SizeVariantsExample() {
  return (
    <div className="flex items-center space-x-4 p-8">
      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Small
          </button>
        </PopoverTrigger>
        <PopoverContent size="sm">
          <Text size="sm">Small popover (16rem width)</Text>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Medium (Default)
          </button>
        </PopoverTrigger>
        <PopoverContent size="md">
          <Text size="sm">Medium popover (20rem width)</Text>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Large
          </button>
        </PopoverTrigger>
        <PopoverContent size="lg">
          <Text size="sm">Large popover (24rem width)</Text>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Auto
          </button>
        </PopoverTrigger>
        <PopoverContent size="auto">
          <Text size="sm">Auto-sized popover based on content</Text>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Example 3: Visual Variants
 * Demonstrates all visual style variants
 */
export function VisualVariantsExample() {
  return (
    <div className="flex items-center space-x-4 p-8">
      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Default
          </button>
        </PopoverTrigger>
        <PopoverContent variant="default">
          <Text size="sm">Default popover with subtle elevation</Text>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Elevated
          </button>
        </PopoverTrigger>
        <PopoverContent variant="elevated">
          <Text size="sm">Elevated popover with stronger shadow</Text>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Bordered
          </button>
        </PopoverTrigger>
        <PopoverContent variant="bordered">
          <Text size="sm">Bordered popover with visible border</Text>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Example 4: Positioning
 * Demonstrates all available positioning options
 */
export function PositioningExample() {
  return (
    <div className="flex items-center justify-center p-24">
      <div className="grid grid-cols-3 gap-4">
        {/* Top Row */}
        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Top Start
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start">
            <Text size="sm">Positioned above, aligned to start</Text>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Top Center
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center">
            <Text size="sm">Positioned above, centered</Text>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Top End
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end">
            <Text size="sm">Positioned above, aligned to end</Text>
          </PopoverContent>
        </Popover>

        {/* Middle Row */}
        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Left
            </button>
          </PopoverTrigger>
          <PopoverContent side="left">
            <Text size="sm">Positioned to the left</Text>
          </PopoverContent>
        </Popover>

        <div className="flex items-center justify-center">
          <Text size="sm" color="muted">
            Trigger
          </Text>
        </div>

        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Right
            </button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <Text size="sm">Positioned to the right</Text>
          </PopoverContent>
        </Popover>

        {/* Bottom Row */}
        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Bottom Start
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <Text size="sm">Positioned below, aligned to start</Text>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Bottom Center
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center">
            <Text size="sm">Positioned below, centered</Text>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Bottom End
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <Text size="sm">Positioned below, aligned to end</Text>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

/**
 * Example 5: With Arrow and Close Button
 * Popover with visual arrow pointing to trigger and close button
 */
export function WithArrowAndCloseExample() {
  return (
    <div className="p-8">
      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Open with Arrow
          </button>
        </PopoverTrigger>
        <PopoverContent showArrow>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <Text size="sm" weight="medium">
                Notification Settings
              </Text>
              <PopoverClose>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </PopoverClose>
            </div>
            <Text size="sm" color="muted">
              Configure how you receive notifications. The arrow points to the
              trigger button.
            </Text>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Example 6: Controlled Popover
 * Demonstrates programmatic control of popover state
 */
export function ControlledPopoverExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Open Programmatically
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Close Programmatically
        </button>
        <Text size="sm" color="muted">
          Status: {open ? 'Open' : 'Closed'}
        </Text>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Toggle Popover
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-2">
            <Text size="sm" weight="medium">
              Controlled Popover
            </Text>
            <Text size="sm" color="muted">
              This popover&apos;s state is controlled externally. You can
              open/close it with the buttons above.
            </Text>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300"
            >
              Close from inside
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Example 7: Form in Popover
 * Demonstrates using form elements inside a popover
 */
export function FormInPopoverExample() {
  const [email, setEmail] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Subscribed with email: ${email}`)
  }

  return (
    <div className="p-8">
      <Popover>
        <PopoverTrigger>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Subscribe to Newsletter
          </button>
        </PopoverTrigger>
        <PopoverContent size="lg">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Text size="sm" weight="medium">
                Stay Updated
              </Text>
              <Text size="xs" color="muted">
                Get the latest news and updates delivered to your inbox.
              </Text>
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                Subscribe
              </button>
              <PopoverClose>
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </PopoverClose>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
