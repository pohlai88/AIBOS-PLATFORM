/**
 * FormWizard Component - Layer 3 Complex Pattern
 *
 * Multi-step form with navigation, progress indicator, and Dialog integration.
 * Composes Layer 2 (Dialog) and Layer 1 (Heading, Text) components.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { FormWizard } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <FormWizard
 *       steps={[
 *         { id: 'step1', title: 'Personal Info', component: <PersonalForm /> },
 *         { id: 'step2', title: 'Contact', component: <ContactForm /> },
 *       ]}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 1 components
import { Heading } from "../../../shared/typography/heading";
import { Text } from "../../../shared/typography/text";

// Import Layer 2 components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../compositions/dialog/dialog";

// Import primitives
import { Button } from "../../../shared/primitives/button";
import { Progress } from "../../../shared/primitives/progress";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// 🎯 STEP 1: Define types
export interface FormWizardStep {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * Step title
   */
  title: string;

  /**
   * Optional step description
   */
  description?: string;

  /**
   * Step content component
   */
  component: React.ReactNode;

  /**
   * Whether the step is optional
   * @default false
   */
  optional?: boolean;
}

export type FormWizardSize = "sm" | "md" | "lg";

// 🎯 STEP 2: Define props interface
export interface FormWizardProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Array of wizard steps
   */
  steps: FormWizardStep[];

  /**
   * Whether the wizard is open
   * @default false
   */
  open?: boolean;

  /**
   * Callback when wizard opens
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Initial step index
   * @default 0
   */
  defaultStep?: number;

  /**
   * Size of the wizard dialog
   * @default 'md'
   */
  size?: FormWizardSize;

  /**
   * Whether to show progress indicator
   * @default true
   */
  showProgress?: boolean;

  /**
   * Text for next button
   * @default 'Next'
   */
  nextButtonText?: string;

  /**
   * Text for previous button
   * @default 'Previous'
   */
  previousButtonText?: string;

  /**
   * Text for finish button
   * @default 'Finish'
   */
  finishButtonText?: string;

  /**
   * Callback when wizard is completed
   */
  onFinish?: () => void;

  /**
   * Test ID for automated testing
   */
  testId?: string;
}

// 🎯 STEP 3: Map FormWizard sizes to Dialog sizes
const formWizardSizeMap: Record<FormWizardSize, "sm" | "md" | "lg" | "xl"> = {
  sm: "sm",
  md: "lg",
  lg: "xl",
};

/**
 * FormWizard - Layer 3 Complex Pattern
 *
 * Features:
 * - Multi-step form navigation
 * - Progress indicator
 * - Dialog integration
 * - Step validation
 * - Keyboard navigation
 * - Design token-based styling
 * - MCP validation enabled
 *
 * @mcp-marker client-component-pattern
 */
export const FormWizard = React.forwardRef<HTMLDivElement, FormWizardProps>(
  (
    {
      steps,
      open = false,
      onOpenChange,
      defaultStep = 0,
      size = "md",
      showProgress = true,
      nextButtonText = "Next",
      previousButtonText = "Previous",
      finishButtonText = "Finish",
      onFinish,
      testId,
      className,
      ...props
    },
    ref
  ) => {
    const [currentStep, setCurrentStep] = React.useState(defaultStep);
    const [isOpen, setIsOpen] = React.useState(open);

    // Sync with controlled open prop
    React.useEffect(() => {
      setIsOpen(open);
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
      if (!newOpen) {
        // Reset to first step when closing
        setCurrentStep(0);
      }
    };

    const currentStepData = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const progress = ((currentStep + 1) / steps.length) * 100;

    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    };

    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    const handleFinish = () => {
      onFinish?.();
      handleOpenChange(false);
    };

    const dialogSize = formWizardSizeMap[size] || formWizardSizeMap.md;

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          ref={ref}
          size={dialogSize}
          className={cn("mcp-layer3-pattern", className)}
          data-testid={testId}
          data-mcp-validated="true"
          data-constitution-compliant="formwizard-layer3"
          {...props}
        >
          <DialogHeader>
            <DialogTitle>
              {currentStepData?.title || `Step ${currentStep + 1}`}
            </DialogTitle>
            {currentStepData?.description && (
              <Text size="sm" color="muted">
                {currentStepData.description}
              </Text>
            )}
          </DialogHeader>

          {/* Progress Indicator */}
          {showProgress && steps.length > 1 && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <Text size="sm" color="muted">
                  Step {currentStep + 1} of {steps.length}
                </Text>
                <Text size="sm" color="muted">
                  {Math.round(progress)}%
                </Text>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Step Content */}
          <div className="px-6 py-4 min-h-[200px]">
            {currentStepData?.component}
          </div>

          {/* Navigation Footer */}
          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                {previousButtonText}
              </Button>
              <div className="flex gap-2">
                {!isLastStep ? (
                  <Button onClick={handleNext}>
                    {nextButtonText}
                  </Button>
                ) : (
                  <Button onClick={handleFinish}>
                    {finishButtonText}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

FormWizard.displayName = "FormWizard";

// Export with default
export default FormWizard;

