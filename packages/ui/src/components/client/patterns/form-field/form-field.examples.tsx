/**
 * FormField Examples
 *
 * Comprehensive usage examples for FormField component
 */

import { FormField } from "./form-field";
import { Input } from "../../../shared/primitives/input";
import { Select } from "../../../shared/primitives/select";
import { Textarea } from "../../../shared/primitives/textarea";

/**
 * Basic FormField
 */
export function BasicFormField() {
  return (
    <FormField label="Email Address" id="email-basic">
      <Input type="email" placeholder="Enter your email" />
    </FormField>
  );
}

/**
 * Required FormField
 */
export function RequiredFormField() {
  return (
    <FormField label="Password" required id="password-required">
      <Input type="password" placeholder="Enter password" />
    </FormField>
  );
}

/**
 * FormField with Helper Text
 */
export function FormFieldWithHelper() {
  return (
    <FormField
      label="Username"
      helper="Must be at least 3 characters"
      id="username-helper"
    >
      <Input type="text" placeholder="Enter username" />
    </FormField>
  );
}

/**
 * FormField with Error
 */
export function FormFieldWithError() {
  return (
    <FormField
      label="Email"
      error="Invalid email format"
      id="email-error"
    >
      <Input type="email" placeholder="Enter email" />
    </FormField>
  );
}

/**
 * FormField with Hint Tooltip
 */
export function FormFieldWithHint() {
  return (
    <FormField
      label="API Key"
      hint="Your API key is stored securely and never shared"
      id="api-key-hint"
    >
      <Input type="password" placeholder="Enter API key" />
    </FormField>
  );
}

/**
 * FormField with All Features
 */
export function FormFieldComplete() {
  return (
    <FormField
      label="Email Address"
      required
      hint="We'll never share your email with anyone"
      helper="Enter a valid email address"
      id="email-complete"
    >
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  );
}

/**
 * Disabled FormField
 */
export function DisabledFormField() {
  return (
    <FormField
      label="Account ID"
      disabled
      helper="This field cannot be changed"
      id="account-id-disabled"
    >
      <Input type="text" value="ACC-12345" readOnly />
    </FormField>
  );
}

/**
 * Different Sizes
 */
export function FormFieldSizes() {
  return (
    <div className="space-y-4">
      <FormField label="Small" size="sm" id="small-field">
        <Input size="sm" placeholder="Small input" />
      </FormField>
      <FormField label="Medium" size="md" id="medium-field">
        <Input size="md" placeholder="Medium input" />
      </FormField>
      <FormField label="Large" size="lg" id="large-field">
        <Input size="lg" placeholder="Large input" />
      </FormField>
    </div>
  );
}

/**
 * FormField with Select
 */
export function FormFieldWithSelect() {
  return (
    <FormField
      label="Country"
      required
      helper="Select your country"
      id="country-select"
    >
      <Select id="country-select">
        <option value="">Choose a country</option>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
        <option value="ca">Canada</option>
      </Select>
    </FormField>
  );
}

/**
 * FormField with Textarea
 */
export function FormFieldWithTextarea() {
  return (
    <FormField
      label="Description"
      helper="Maximum 500 characters"
      id="description-textarea"
    >
      <Textarea
        id="description-textarea"
        placeholder="Enter description"
        rows={4}
      />
    </FormField>
  );
}

