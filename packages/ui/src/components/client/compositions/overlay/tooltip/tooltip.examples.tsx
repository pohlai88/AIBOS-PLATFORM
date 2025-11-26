/**
 * Tooltip Component Examples
 * Demonstrates various usage patterns and configurations of the Tooltip composition component.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-tooltip
 * @category Client Components
 * @example
 * import { BasicTooltipExample } from '@aibos/ui/compositions/tooltip/examples';
 *
 * export default function Page() {
 *   return <BasicTooltipExample />;
 * }
 */

'use client'

import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

/**
 * Example 1: Basic Tooltip
 * Simple tooltip with default settings
 */
export function BasicTooltipExample() {
  return (
    <TooltipProvider>
      <div className="p-8">
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Hover me
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a helpful tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

/**
 * Example 2: Size Variants
 * Demonstrates all available size variants
 */
export function SizeVariantsExample() {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4 p-8">
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Small
            </button>
          </TooltipTrigger>
          <TooltipContent size="sm">
            <p>Small tooltip - max 180px width</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Medium (Default)
            </button>
          </TooltipTrigger>
          <TooltipContent size="md">
            <p>Medium tooltip - max 240px width, perfect for most use cases</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Large
            </button>
          </TooltipTrigger>
          <TooltipContent size="lg">
            <p>
              Large tooltip - max 320px width, great for longer explanations or
              detailed information
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

/**
 * Example 3: Visual Variants
 * Demonstrates all visual style variants
 */
export function VisualVariantsExample() {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4 p-8">
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Default
            </button>
          </TooltipTrigger>
          <TooltipContent variant="default">
            <p>Default tooltip with subtle elevation</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Dark
            </button>
          </TooltipTrigger>
          <TooltipContent variant="dark">
            <p>Dark tooltip with high contrast</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Light
            </button>
          </TooltipTrigger>
          <TooltipContent variant="light">
            <p>Light tooltip with white background</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Bordered
            </button>
          </TooltipTrigger>
          <TooltipContent variant="bordered">
            <p>Bordered tooltip with prominent border</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

/**
 * Example 4: Positioning
 * Demonstrates all available positioning options
 */
export function PositioningExample() {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-center p-24">
        <div className="grid grid-cols-3 gap-4">
          {/* Top Row */}
          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Top Start
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="start">
              <p>Above, aligned to start</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Top Center
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <p>Above, centered</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Top End
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="end">
              <p>Above, aligned to end</p>
            </TooltipContent>
          </Tooltip>

          {/* Middle Row */}
          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Left
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>To the left</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">Trigger</p>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Right
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>To the right</p>
            </TooltipContent>
          </Tooltip>

          {/* Bottom Row */}
          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Bottom Start
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <p>Below, aligned to start</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Bottom Center
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              <p>Below, centered</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Bottom End
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Below, aligned to end</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * Example 5: With Arrow
 * Tooltip with visual arrow pointing to trigger
 */
export function WithArrowExample() {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4 p-8">
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Default with Arrow
            </button>
          </TooltipTrigger>
          <TooltipContent showArrow>
            <p>Notice the arrow pointing to the button</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Dark with Arrow
            </button>
          </TooltipTrigger>
          <TooltipContent variant="dark" showArrow>
            <p>Dark tooltip with arrow</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

/**
 * Example 6: Controlled Tooltip
 * Demonstrates programmatic control of tooltip state
 */
export function ControlledTooltipExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <TooltipProvider>
      <div className="space-y-4 p-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Show Tooltip
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Hide Tooltip
          </button>
          <p className="text-sm text-gray-600">
            Status: {open ? 'Open' : 'Closed'}
          </p>
        </div>

        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Controlled Trigger
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This tooltip is controlled by external state</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

/**
 * Example 7: Custom Delay
 * Demonstrates custom delay duration for tooltip appearance
 */
export function CustomDelayExample() {
  return (
    <div className="flex items-center space-x-4 p-8">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Instant (0ms)
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Appears immediately</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Default (200ms)
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Appears after 200ms</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Slow (1000ms)
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Appears after 1 second</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

/**
 * Example 8: Icon with Tooltip
 * Common pattern: icon button with explanatory tooltip
 */
export function IconWithTooltipExample() {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-4 p-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>More information</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="rounded p-2 text-red-600 hover:bg-red-50 hover:text-red-700">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent variant="dark">
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
