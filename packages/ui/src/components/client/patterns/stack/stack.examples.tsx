/**
 * Stack Component Examples
 * Usage examples for the Stack Layer 3 pattern component
 */

import { Stack } from "./stack";
import { Card } from "../card/card";
import { Text } from "../../../shared/primitives/typography/text";

/**
 * Basic vertical stack
 */
export function BasicStack() {
  return (
    <Stack>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Stack>
  );
}

/**
 * Horizontal stack
 */
export function HorizontalStack() {
  return (
    <Stack direction="row" spacing="md">
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Stack>
  );
}

/**
 * Stack with different spacing
 */
export function StackSpacing() {
  return (
    <div className="space-y-4">
      <Stack spacing="xs">
        <Text>Extra Small Spacing</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
      <Stack spacing="sm">
        <Text>Small Spacing</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
      <Stack spacing="md">
        <Text>Medium Spacing (default)</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
      <Stack spacing="lg">
        <Text>Large Spacing</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
    </div>
  );
}

/**
 * Stack with alignment
 */
export function StackAlignment() {
  return (
    <div className="space-y-4">
      <Stack align="start">
        <Text>Start Aligned</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
      <Stack align="center">
        <Text>Center Aligned</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
      <Stack align="end">
        <Text>End Aligned</Text>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
      </Stack>
    </div>
  );
}

/**
 * Stack with justification
 */
export function StackJustification() {
  return (
    <div className="space-y-4">
      <Stack direction="row" justify="start">
        <Card>Start</Card>
        <Card>Justified</Card>
      </Stack>
      <Stack direction="row" justify="center">
        <Card>Center</Card>
        <Card>Justified</Card>
      </Stack>
      <Stack direction="row" justify="between">
        <Card>Space</Card>
        <Card>Between</Card>
      </Stack>
      <Stack direction="row" justify="around">
        <Card>Space</Card>
        <Card>Around</Card>
      </Stack>
    </div>
  );
}

/**
 * Stack with wrap
 */
export function StackWrap() {
  return (
    <Stack direction="row" wrap="wrap" spacing="md">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} style={{ minWidth: "200px" }}>
          Item {i}
        </Card>
      ))}
    </Stack>
  );
}

/**
 * Stack with custom gap
 */
export function StackCustomGap() {
  return (
    <Stack gap="32px">
      <Card>Custom Gap: 32px</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Stack>
  );
}

/**
 * Nested stacks
 */
export function NestedStacks() {
  return (
    <Stack spacing="lg">
      <Text>Main Stack</Text>
      <Stack direction="row" spacing="md">
        <Card>Nested Row 1</Card>
        <Card>Nested Row 2</Card>
      </Stack>
      <Stack spacing="sm">
        <Card>Nested Column 1</Card>
        <Card>Nested Column 2</Card>
      </Stack>
    </Stack>
  );
}

