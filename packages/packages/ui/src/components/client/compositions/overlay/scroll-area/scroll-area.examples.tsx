/**
 * ScrollArea Component Examples
 * Demonstrates various usage patterns and configurations of the ScrollArea composition component.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-scroll-area
 * @category Client Components
 */

'use client'

import { Text } from '../../../../shared/typography/text'
import { ScrollArea } from './scroll-area'

/**
 * Example 1: Basic Vertical Scroll
 * Simple scrollable area with vertical scrolling
 */
export function BasicScrollAreaExample() {
  return (
    <div className="p-8">
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {Array.from({ length: 50 }).map((_, i) => (
            <Text key={i} size="sm">
              Item {i + 1} - This is a scrollable content item. Scroll down to
              see more items!
            </Text>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * Example 2: Horizontal Scroll
 * Scrollable area with horizontal scrolling
 */
export function HorizontalScrollExample() {
  return (
    <div className="p-8">
      <ScrollArea scrollType="horizontal" className="w-full rounded-md border">
        <div className="flex gap-4 p-4" style={{ width: 'max-content' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex h-40 w-64 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white"
            >
              Card {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * Example 3: Both Directions
 * Scrollable area with both vertical and horizontal scrolling
 */
export function BothDirectionsExample() {
  return (
    <div className="p-8">
      <ScrollArea
        scrollType="both"
        className="h-[400px] w-full rounded-md border p-4"
      >
        <div className="grid grid-cols-10 gap-4" style={{ minWidth: '2000px' }}>
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="flex h-24 items-center justify-center rounded-md bg-gradient-to-br from-green-400 to-blue-500 font-semibold text-white"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * Example 4: Scrollbar Size Variants
 * Demonstrates different scrollbar sizes
 */
export function ScrollbarSizeExample() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Small Scrollbar
        </Text>
        <ScrollArea
          scrollbarSize="sm"
          className="h-[200px] w-full rounded-md border p-4"
        >
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} size="sm">
                Line {i + 1}
              </Text>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Medium Scrollbar (Default)
        </Text>
        <ScrollArea
          scrollbarSize="md"
          className="h-[200px] w-full rounded-md border p-4"
        >
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} size="sm">
                Line {i + 1}
              </Text>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Large Scrollbar
        </Text>
        <ScrollArea
          scrollbarSize="lg"
          className="h-[200px] w-full rounded-md border p-4"
        >
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} size="sm">
                Line {i + 1}
              </Text>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

/**
 * Example 5: Scrollbar Visibility Variants
 * Demonstrates different visibility behaviors
 */
export function ScrollbarVisibilityExample() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Always Visible
        </Text>
        <ScrollArea
          scrollbarVisibility="always"
          className="h-[200px] w-full rounded-md border p-4"
        >
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} size="sm">
                Line {i + 1}
              </Text>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Hover to Show (Default)
        </Text>
        <ScrollArea
          scrollbarVisibility="hover"
          className="h-[200px] w-full rounded-md border p-4"
        >
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} size="sm">
                Line {i + 1}
              </Text>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Show on Scroll
        </Text>
        <ScrollArea
          scrollbarVisibility="scroll"
          className="h-[200px] w-full rounded-md border p-4"
        >
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Text key={i} size="sm">
                Line {i + 1}
              </Text>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

/**
 * Example 6: Code Block with Syntax
 * Practical use case: scrollable code block
 */
export function CodeBlockExample() {
  const codeExample = `
function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

const cart = [
  { name: 'Widget', price: 19.99, quantity: 2 },
  { name: 'Gadget', price: 29.99, quantity: 1 },
  { name: 'Doohickey', price: 9.99, quantity: 5 },
];

const total = calculateTotal(cart);
console.log(\`Total: $\${total.toFixed(2)}\`);
  `.trim()

  return (
    <div className="p-8">
      <ScrollArea className="h-[300px] w-full rounded-md border bg-gray-900 p-4">
        <pre className="font-mono text-sm text-green-400">
          <code>{codeExample}</code>
        </pre>
      </ScrollArea>
    </div>
  )
}

/**
 * Example 7: Image Gallery
 * Practical use case: scrollable image grid
 */
export function ImageGalleryExample() {
  return (
    <div className="p-8">
      <ScrollArea className="h-[500px] w-full rounded-md border p-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-xl font-semibold text-white"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * Example 8: Chat Messages
 * Practical use case: chat message list
 */
export function ChatMessagesExample() {
  const messages = [
    { id: 1, user: 'Alice', message: 'Hey, how are you?', time: '10:30 AM' },
    {
      id: 2,
      user: 'Bob',
      message: "I'm doing great! How about you?",
      time: '10:32 AM',
    },
    {
      id: 3,
      user: 'Alice',
      message: 'Pretty good! Working on the new project',
      time: '10:33 AM',
    },
    { id: 4, user: 'Bob', message: 'Nice! Need any help?', time: '10:35 AM' },
    {
      id: 5,
      user: 'Alice',
      message: 'Actually, yes. Can you review my PR?',
      time: '10:36 AM',
    },
    {
      id: 6,
      user: 'Bob',
      message: 'Sure thing! Send me the link',
      time: '10:37 AM',
    },
    {
      id: 7,
      user: 'Alice',
      message: 'https://github.com/company/repo/pull/123',
      time: '10:38 AM',
    },
    {
      id: 8,
      user: 'Bob',
      message: 'Got it. Will take a look now',
      time: '10:39 AM',
    },
    {
      id: 9,
      user: 'Alice',
      message: 'Thanks! Appreciate it',
      time: '10:40 AM',
    },
    {
      id: 10,
      user: 'Bob',
      message: 'No problem! Looking good so far',
      time: '10:45 AM',
    },
    { id: 11, user: 'Alice', message: 'Great to hear!', time: '10:46 AM' },
    {
      id: 12,
      user: 'Bob',
      message: 'Left some comments. Check them out',
      time: '10:50 AM',
    },
    {
      id: 13,
      user: 'Alice',
      message: 'Will do. Thanks again!',
      time: '10:51 AM',
    },
  ]

  return (
    <div className="p-8">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg border">
        <div className="border-b bg-gray-100 px-4 py-3">
          <Text size="sm" weight="semibold">
            Chat Messages
          </Text>
        </div>
        <ScrollArea className="h-[400px] bg-white">
          <div className="space-y-3 p-4">
            {messages.map(msg => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <Text size="sm" weight="semibold">
                    {msg.user}
                  </Text>
                  <Text size="xs" color="muted">
                    {msg.time}
                  </Text>
                </div>
                <Text size="sm" className="pl-4">
                  {msg.message}
                </Text>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
