/**
 * Tabs Component Examples
 * Usage examples for the Tabs Layer 3 pattern component
 */

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Card, CardBody, CardHeader } from "../card/card";

/**
 * Basic tabs
 */
export function BasicTabs() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  );
}

/**
 * Tabs with cards
 */
export function TabsWithCards() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader title="Overview" />
          <CardBody>
            <p>Overview content goes here</p>
          </CardBody>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader title="Settings" />
          <CardBody>
            <p>Settings content goes here</p>
          </CardBody>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader title="Analytics" />
          <CardBody>
            <p>Analytics content goes here</p>
          </CardBody>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

/**
 * Controlled tabs
 */
export function ControlledTabs() {
  const [value, setValue] = React.useState("tab1");

  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Current tab: {value}</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Current tab: {value}</p>
      </TabsContent>
    </Tabs>
  );
}

/**
 * Disabled tab
 */
export function DisabledTab() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled Tab
        </TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>This content won't be shown</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  );
}

/**
 * Vertical tabs
 */
export function VerticalTabs() {
  return (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex gap-4">
      <TabsList className="flex-col">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="tab1">
          <p>Content for Tab 1</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p>Content for Tab 2</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p>Content for Tab 3</p>
        </TabsContent>
      </div>
    </Tabs>
  );
}

/**
 * Tabs with many items
 */
export function ManyTabs() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList className="overflow-x-auto">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        <TabsTrigger value="tab5">Tab 5</TabsTrigger>
        <TabsTrigger value="tab6">Tab 6</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
      <TabsContent value="tab4">
        <p>Content for Tab 4</p>
      </TabsContent>
      <TabsContent value="tab5">
        <p>Content for Tab 5</p>
      </TabsContent>
      <TabsContent value="tab6">
        <p>Content for Tab 6</p>
      </TabsContent>
    </Tabs>
  );
}

