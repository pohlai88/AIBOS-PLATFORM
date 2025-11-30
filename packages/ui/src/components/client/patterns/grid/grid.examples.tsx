/**
 * Grid Component Examples
 * Usage examples for the Grid Layer 3 pattern component
 */

import { Grid, GridItem } from "./grid";
import { Card } from "../card/card";
import { Text } from "../../../shared/primitives/typography/text";

/**
 * Basic grid
 */
export function BasicGrid() {
  return (
    <Grid columns={12} gap="md">
      <GridItem span={6}>
        <Card>Left Column</Card>
      </GridItem>
      <GridItem span={6}>
        <Card>Right Column</Card>
      </GridItem>
    </Grid>
  );
}

/**
 * Three column grid
 */
export function ThreeColumnGrid() {
  return (
    <Grid columns={12} gap="md">
      <GridItem span={4}>
        <Card>Column 1</Card>
      </GridItem>
      <GridItem span={4}>
        <Card>Column 2</Card>
      </GridItem>
      <GridItem span={4}>
        <Card>Column 3</Card>
      </GridItem>
    </Grid>
  );
}

/**
 * Grid with different gaps
 */
export function GridGaps() {
  return (
    <div className="space-y-4">
      <div>
        <Text>Small Gap</Text>
        <Grid columns={12} gap="sm">
          <GridItem span={6}>
            <Card>Item 1</Card>
          </GridItem>
          <GridItem span={6}>
            <Card>Item 2</Card>
          </GridItem>
        </Grid>
      </div>
      <div>
        <Text>Medium Gap (default)</Text>
        <Grid columns={12} gap="md">
          <GridItem span={6}>
            <Card>Item 1</Card>
          </GridItem>
          <GridItem span={6}>
            <Card>Item 2</Card>
          </GridItem>
        </Grid>
      </div>
      <div>
        <Text>Large Gap</Text>
        <Grid columns={12} gap="lg">
          <GridItem span={6}>
            <Card>Item 1</Card>
          </GridItem>
          <GridItem span={6}>
            <Card>Item 2</Card>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
}

/**
 * Grid with alignment
 */
export function GridAlignment() {
  return (
    <div className="space-y-4">
      <div>
        <Text>Start Aligned</Text>
        <Grid columns={12} gap="md" align="start">
          <GridItem span={4}>
            <Card style={{ height: "100px" }}>Item 1</Card>
          </GridItem>
          <GridItem span={4}>
            <Card style={{ height: "150px" }}>Item 2</Card>
          </GridItem>
        </Grid>
      </div>
      <div>
        <Text>Center Aligned</Text>
        <Grid columns={12} gap="md" align="center">
          <GridItem span={4}>
            <Card style={{ height: "100px" }}>Item 1</Card>
          </GridItem>
          <GridItem span={4}>
            <Card style={{ height: "150px" }}>Item 2</Card>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
}

/**
 * Grid with custom gap
 */
export function GridCustomGap() {
  return (
    <Grid columns={12} gapValue="32px">
      <GridItem span={6}>
        <Card>Custom Gap: 32px</Card>
      </GridItem>
      <GridItem span={6}>
        <Card>Item 2</Card>
      </GridItem>
    </Grid>
  );
}

/**
 * Grid with different column counts
 */
export function GridColumnCounts() {
  return (
    <div className="space-y-4">
      <div>
        <Text>2 Columns</Text>
        <Grid columns={2} gap="md">
          <GridItem span={1}>
            <Card>Item 1</Card>
          </GridItem>
          <GridItem span={1}>
            <Card>Item 2</Card>
          </GridItem>
        </Grid>
      </div>
      <div>
        <Text>4 Columns</Text>
        <Grid columns={4} gap="md">
          {[1, 2, 3, 4].map((i) => (
            <GridItem key={i} span={1}>
              <Card>Item {i}</Card>
            </GridItem>
          ))}
        </Grid>
      </div>
      <div>
        <Text>6 Columns</Text>
        <Grid columns={6} gap="md">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GridItem key={i} span={1}>
              <Card>Item {i}</Card>
            </GridItem>
          ))}
        </Grid>
      </div>
    </div>
  );
}

/**
 * Grid with start/end positioning
 */
export function GridPositioning() {
  return (
    <Grid columns={12} gap="md">
      <GridItem start={1} end={5}>
        <Card>Starts at 1, ends at 5</Card>
      </GridItem>
      <GridItem start={7} end={13}>
        <Card>Starts at 7, ends at 13</Card>
      </GridItem>
    </Grid>
  );
}

/**
 * Complex grid layout
 */
export function ComplexGrid() {
  return (
    <Grid columns={12} gap="md">
      <GridItem span={12}>
        <Card>Full Width Header</Card>
      </GridItem>
      <GridItem span={3}>
        <Card>Sidebar</Card>
      </GridItem>
      <GridItem span={9}>
        <Card>Main Content</Card>
      </GridItem>
      <GridItem span={12}>
        <Card>Full Width Footer</Card>
      </GridItem>
    </Grid>
  );
}

