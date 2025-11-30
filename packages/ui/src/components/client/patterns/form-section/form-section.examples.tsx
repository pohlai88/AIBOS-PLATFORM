/**
 * FormSection Examples
 *
 * Comprehensive usage examples for FormSection component
 */

import { FormSection } from "./form-section";
import { FormField } from "../form-field/form-field";
import { Input } from "../../../../shared/primitives/input";
import { Select } from "../../../../shared/primitives/select";
import { Textarea } from "../../../../shared/primitives/textarea";

/**
 * Basic FormSection
 */
export function BasicFormSection() {
  return (
    <FormSection title="Personal Information">
      <FormField label="First Name" id="firstName">
        <Input id="firstName" />
      </FormField>
      <FormField label="Last Name" id="lastName">
        <Input id="lastName" />
      </FormField>
    </FormSection>
  );
}

/**
 * FormSection with Description
 */
export function FormSectionWithDescription() {
  return (
    <FormSection
      title="Contact Details"
      description="Enter your contact information"
    >
      <FormField label="Email" required id="email">
        <Input id="email" type="email" />
      </FormField>
      <FormField label="Phone" id="phone">
        <Input id="phone" type="tel" />
      </FormField>
    </FormSection>
  );
}

/**
 * FormSection with Multiple Fields
 */
export function FormSectionMultipleFields() {
  return (
    <FormSection title="Shipping Address" description="Where should we ship your order?">
      <FormField label="Street Address" required id="street">
        <Input id="street" />
      </FormField>
      <FormField label="City" required id="city">
        <Input id="city" />
      </FormField>
      <FormField label="State" required id="state">
        <Select id="state">
          <option value="">Select state</option>
          <option value="ca">California</option>
          <option value="ny">New York</option>
        </Select>
      </FormField>
      <FormField label="ZIP Code" required id="zip">
        <Input id="zip" />
      </FormField>
    </FormSection>
  );
}

/**
 * Collapsible FormSection
 */
export function CollapsibleFormSection() {
  return (
    <FormSection
      title="Advanced Settings"
      description="Optional configuration options"
      collapsible
      defaultCollapsed
    >
      <FormField label="API Endpoint" id="api-endpoint">
        <Input id="api-endpoint" />
      </FormField>
      <FormField label="Timeout" id="timeout">
        <Input id="timeout" type="number" />
      </FormField>
    </FormSection>
  );
}

/**
 * Different Sizes
 */
export function FormSectionSizes() {
  return (
    <div className="space-y-6">
      <FormSection title="Small Section" size="sm">
        <FormField label="Field" id="small-field">
          <Input id="small-field" />
        </FormField>
      </FormSection>
      <FormSection title="Medium Section" size="md">
        <FormField label="Field" id="medium-field">
          <Input id="medium-field" />
        </FormField>
      </FormSection>
      <FormSection title="Large Section" size="lg">
        <FormField label="Field" id="large-field">
          <Input id="large-field" />
        </FormField>
      </FormSection>
    </div>
  );
}

/**
 * Multiple Sections
 */
export function MultipleFormSections() {
  return (
    <div className="space-y-8">
      <FormSection title="Account Information">
        <FormField label="Username" required id="username">
          <Input id="username" />
        </FormField>
        <FormField label="Email" required id="email">
          <Input id="email" type="email" />
        </FormField>
      </FormSection>
      <FormSection title="Profile">
        <FormField label="Bio" id="bio">
          <Textarea id="bio" rows={4} />
        </FormField>
        <FormField label="Website" id="website">
          <Input id="website" type="url" />
        </FormField>
      </FormSection>
    </div>
  );
}

/**
 * FormSection without Title
 */
export function FormSectionNoTitle() {
  return (
    <FormSection>
      <FormField label="Field 1" id="field1">
        <Input id="field1" />
      </FormField>
      <FormField label="Field 2" id="field2">
        <Input id="field2" />
      </FormField>
    </FormSection>
  );
}



