/**
 * Accordion Component Examples
 * Usage examples for the Accordion Layer 3 pattern component
 */

import * as React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
import { Card, CardBody } from "../card/card";

/**
 * Basic accordion
 */
export function BasicAccordion() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It uses CSS animations for smooth transitions.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Multiple items open
 */
export function MultipleAccordion() {
  return (
    <Accordion type="multiple">
      <AccordionItem value="item1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          <p>Content for section 1. Multiple sections can be open at once.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          <p>Content for section 2.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          <p>Content for section 3.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Accordion with cards
 */
export function AccordionWithCards() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="overview">
        <AccordionTrigger>Overview</AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardBody>
              <p>Overview content goes here</p>
            </CardBody>
          </Card>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="details">
        <AccordionTrigger>Details</AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardBody>
              <p>Details content goes here</p>
            </CardBody>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Controlled accordion
 */
export function ControlledAccordion() {
  const [value, setValue] = React.useState<string>("item1");

  return (
    <Accordion type="single" value={value} onValueChange={setValue}>
      <AccordionItem value="item1">
        <AccordionTrigger>Item 1</AccordionTrigger>
        <AccordionContent>
          <p>Current value: {value}</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Item 2</AccordionTrigger>
        <AccordionContent>
          <p>Current value: {value}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Disabled item
 */
export function DisabledAccordion() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item1">
        <AccordionTrigger>Enabled Item</AccordionTrigger>
        <AccordionContent>
          <p>This item can be opened</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2" disabled>
        <AccordionTrigger>Disabled Item</AccordionTrigger>
        <AccordionContent>
          <p>This item cannot be opened</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Non-collapsible accordion
 */
export function NonCollapsibleAccordion() {
  return (
    <Accordion type="single" collapsible={false} defaultValue="item1">
      <AccordionItem value="item1">
        <AccordionTrigger>Always Open</AccordionTrigger>
        <AccordionContent>
          <p>This item cannot be closed once opened.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Can Open</AccordionTrigger>
        <AccordionContent>
          <p>This item can be opened, but item 1 will stay open.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

