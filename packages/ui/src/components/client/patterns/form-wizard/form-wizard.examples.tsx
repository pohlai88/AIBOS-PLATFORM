/**
 * FormWizard Examples
 *
 * Comprehensive usage examples for FormWizard component
 */

import { FormWizard, type FormWizardStep } from "./form-wizard";
import { FormField } from "../form-field/form-field";
import { FormSection } from "../form-section/form-section";
import { Input } from "../../../../shared/primitives/input";
import { Button } from "../../../../shared/primitives/button";
import * as React from "react";

/**
 * Basic FormWizard
 */
export function BasicFormWizard() {
  const [open, setOpen] = React.useState(false);

  const steps: FormWizardStep[] = [
    {
      id: "step1",
      title: "Personal Information",
      component: (
        <FormField label="Name" required id="name">
          <Input id="name" />
        </FormField>
      ),
    },
    {
      id: "step2",
      title: "Contact Details",
      component: (
        <FormField label="Email" required id="email">
          <Input id="email" type="email" />
        </FormField>
      ),
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Start Wizard</Button>
      <FormWizard steps={steps} open={open} onOpenChange={setOpen} />
    </>
  );
}

/**
 * FormWizard with Multiple Steps
 */
export function MultiStepFormWizard() {
  const [open, setOpen] = React.useState(false);

  const steps: FormWizardStep[] = [
    {
      id: "step1",
      title: "Account Setup",
      description: "Create your account",
      component: (
        <div className="space-y-4">
          <FormField label="Username" required id="username">
            <Input id="username" />
          </FormField>
          <FormField label="Password" required id="password">
            <Input id="password" type="password" />
          </FormField>
        </div>
      ),
    },
    {
      id: "step2",
      title: "Personal Information",
      description: "Tell us about yourself",
      component: (
        <div className="space-y-4">
          <FormField label="First Name" required id="firstName">
            <Input id="firstName" />
          </FormField>
          <FormField label="Last Name" required id="lastName">
            <Input id="lastName" />
          </FormField>
        </div>
      ),
    },
    {
      id: "step3",
      title: "Contact",
      description: "How can we reach you?",
      component: (
        <div className="space-y-4">
          <FormField label="Email" required id="email">
            <Input id="email" type="email" />
          </FormField>
          <FormField label="Phone" id="phone">
            <Input id="phone" type="tel" />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Start Multi-Step Wizard</Button>
      <FormWizard
        steps={steps}
        open={open}
        onOpenChange={setOpen}
        onFinish={() => alert("Wizard completed!")}
      />
    </>
  );
}

/**
 * FormWizard with Custom Button Text
 */
export function FormWizardCustomButtons() {
  const [open, setOpen] = React.useState(false);

  const steps: FormWizardStep[] = [
    {
      id: "step1",
      title: "Step 1",
      component: <div>Step 1 content</div>,
    },
    {
      id: "step2",
      title: "Step 2",
      component: <div>Step 2 content</div>,
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Custom Buttons</Button>
      <FormWizard
        steps={steps}
        open={open}
        onOpenChange={setOpen}
        nextButtonText="Continue"
        previousButtonText="Go Back"
        finishButtonText="Complete"
      />
    </>
  );
}

/**
 * FormWizard without Progress
 */
export function FormWizardNoProgress() {
  const [open, setOpen] = React.useState(false);

  const steps: FormWizardStep[] = [
    {
      id: "step1",
      title: "Step 1",
      component: <div>Content</div>,
    },
    {
      id: "step2",
      title: "Step 2",
      component: <div>Content</div>,
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>No Progress</Button>
      <FormWizard steps={steps} open={open} onOpenChange={setOpen} showProgress={false} />
    </>
  );
}

/**
 * FormWizard Different Sizes
 */
export function FormWizardSizes() {
  const [open, setOpen] = React.useState(false);

  const steps: FormWizardStep[] = [
    {
      id: "step1",
      title: "Step 1",
      component: <div>Content</div>,
    },
  ];

  return (
    <>
      <div className="space-x-2">
        <Button onClick={() => setOpen(true)}>Small</Button>
        <Button onClick={() => setOpen(true)}>Medium</Button>
        <Button onClick={() => setOpen(true)}>Large</Button>
      </div>
      <FormWizard steps={steps} open={open} onOpenChange={setOpen} size="lg" />
    </>
  );
}



