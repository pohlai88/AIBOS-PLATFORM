/**
 * Card Examples
 *
 * @layer Layer 3 - Complex Patterns
 * @category Examples
 */

'use client'

import React from 'react'
import { Card, CardHeader, CardBody, CardFooter } from './card'
import { Text } from '../../../shared/typography/text'

/**
 * Example 1: Basic Card
 */
export function BasicCardExample() {
  return (
    <div className="p-8 space-y-4">
      <Card>
        <CardHeader title="Basic Card" description="A simple card with header and body" />
        <CardBody>
          <Text>This is the card content area. You can put any content here.</Text>
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * Example 2: Card with Footer
 */
export function CardWithFooterExample() {
  return (
    <div className="p-8 space-y-4">
      <Card>
        <CardHeader title="Card with Footer" description="Includes action buttons" />
        <CardBody>
          <Text>Card content goes here.</Text>
        </CardBody>
        <CardFooter>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Action
          </button>
          <button className="px-4 py-2 border border-border rounded-md">
            Cancel
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Example 3: Variant Examples
 */
export function VariantExamples() {
  return (
    <div className="p-8 space-y-4">
      <Card variant="default">
        <CardHeader title="Default Variant" />
        <CardBody>
          <Text>Default card with border.</Text>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Outlined Variant" />
        <CardBody>
          <Text>Card with prominent border.</Text>
        </CardBody>
      </Card>

      <Card variant="elevated">
        <CardHeader title="Elevated Variant" />
        <CardBody>
          <Text>Card with shadow elevation.</Text>
        </CardBody>
      </Card>

      <Card variant="filled">
        <CardHeader title="Filled Variant" />
        <CardBody>
          <Text>Card with filled background.</Text>
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * Example 4: Size Variants
 */
export function SizeVariantsExample() {
  return (
    <div className="p-8 space-y-4">
      <Card size="sm">
        <CardHeader title="Small Card" />
        <CardBody>
          <Text>Small size card with compact spacing.</Text>
        </CardBody>
      </Card>

      <Card size="md">
        <CardHeader title="Medium Card" />
        <CardBody>
          <Text>Medium size card with standard spacing.</Text>
        </CardBody>
      </Card>

      <Card size="lg">
        <CardHeader title="Large Card" />
        <CardBody>
          <Text>Large size card with generous spacing.</Text>
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * Example 5: Interactive Card
 */
export function InteractiveCardExample() {
  return (
    <div className="p-8 space-y-4">
      <Card clickable hoverable onClick={() => alert('Card clicked!')}>
        <CardHeader title="Clickable Card" description="Click anywhere on the card" />
        <CardBody>
          <Text>This card is clickable and has hover effects.</Text>
        </CardBody>
      </Card>

      <Card hoverable>
        <CardHeader title="Hoverable Card" description="Hover to see effects" />
        <CardBody>
          <Text>This card has hover effects but is not clickable.</Text>
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * Example 6: Custom Header Content
 */
export function CustomHeaderExample() {
  return (
    <div className="p-8 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Custom Header</h3>
              <p className="text-sm text-muted-foreground">With custom content</p>
            </div>
            <button className="text-sm text-primary">Edit</button>
          </div>
        </CardHeader>
        <CardBody>
          <Text>Card with custom header layout.</Text>
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * Example 7: Dashboard Card (ERP Use Case)
 */
export function DashboardCardExample() {
  return (
    <div className="p-8 space-y-4">
      <Card variant="elevated" hoverable>
        <CardHeader 
          title="Total Revenue" 
          description="Last 30 days" 
        />
        <CardBody>
          <div className="space-y-2">
            <Text className="text-3xl font-bold">RM 125,430</Text>
            <Text size="sm" color="muted">+12.5% from last month</Text>
          </div>
        </CardBody>
        <CardFooter>
          <button className="text-sm text-primary hover:underline">
            View Details
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}

