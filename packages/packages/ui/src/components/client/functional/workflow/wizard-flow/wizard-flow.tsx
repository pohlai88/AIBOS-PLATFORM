/**
 * WizardFlow Component - Layer 3 Functional Component
 * @module WizardFlow
 * @layer 3
 * @category workflow
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens, spacingTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { WizardFlowProps } from "./wizard-flow.types";

const wizardFlowVariants = {
  base: ["w-full", "mcp-functional-component"].join(" "),
  stepIndicator: [
    "flex items-center justify-between mb-6",
  ].join(" "),
  content: [
    "min-h-[200px]",
    spacingTokens.lg,
  ].join(" "),
  footer: [
    "flex items-center justify-between pt-4 border-t",
    colorTokens.border,
  ].join(" "),
  button: [
    "px-4 py-2",
    radiusTokens.md,
    "font-medium text-sm",
    "transition-colors",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
};

export function WizardFlow({
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
  onCancel,
  showStepIndicator = true,
  allowSkipOptional = false,
  nextLabel = "Next",
  prevLabel = "Back",
  completeLabel = "Complete",
  cancelLabel = "Cancel",
  testId,
  className,
}: WizardFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [isValidating, setIsValidating] = React.useState(false);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goToStep = async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    if (stepIndex > currentStep && step?.validate) {
      setIsValidating(true);
      const isValid = await step.validate();
      setIsValidating(false);
      if (!isValid) return;
    }

    setCurrentStep(stepIndex);
    onStepChange?.(stepIndex);
  };

  const handleNext = async () => {
    if (isLastStep) {
      if (step?.validate) {
        setIsValidating(true);
        const isValid = await step.validate();
        setIsValidating(false);
        if (!isValid) return;
      }
      onComplete?.();
    } else {
      await goToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    goToStep(currentStep - 1);
  };

  return (
    <div
      role="region"
      aria-label="Wizard flow"
      className={cn(wizardFlowVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {/* Step indicator */}
      {showStepIndicator && (
        <nav aria-label="Wizard steps" className={wizardFlowVariants.stepIndicator}>
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => index < currentStep && goToStep(index)}
                disabled={index > currentStep}
                aria-current={index === currentStep ? "step" : undefined}
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium",
                  index === currentStep && "bg-primary text-primary-foreground",
                  index < currentStep && "bg-success text-success-foreground cursor-pointer",
                  index > currentStep && cn(colorTokens.bgMuted, colorTokens.fgMuted),
                  "focus-visible:outline-2 focus-visible:outline-primary"
                )}
              >
                {index + 1}
                <span className="sr-only">
                  Step {index + 1}: {s.title}
                  {index === currentStep ? " (current)" : ""}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-12 mx-2",
                    index < currentStep ? "bg-success" : colorTokens.bgMuted
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Step title */}
      <div className="mb-4">
        <h2 className={cn("text-lg font-semibold", colorTokens.fg)}>{step?.title}</h2>
        {step?.description && (
          <p className={cn("text-sm", colorTokens.fgMuted)}>{step.description}</p>
        )}
      </div>

      {/* Step content */}
      <div className={wizardFlowVariants.content}>{step?.content}</div>

      {/* Footer */}
      <div className={wizardFlowVariants.footer}>
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={cn(wizardFlowVariants.button, colorTokens.fgMuted, "hover:bg-muted")}
            >
              {cancelLabel}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={handlePrev}
              className={cn(wizardFlowVariants.button, colorTokens.bgMuted, "hover:opacity-80")}
            >
              {prevLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isValidating}
            className={cn(
              wizardFlowVariants.button,
              "bg-primary text-primary-foreground hover:opacity-90",
              isValidating && "opacity-50 cursor-not-allowed"
            )}
          >
            {isValidating ? "Validating..." : isLastStep ? completeLabel : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

WizardFlow.displayName = "WizardFlow";

export { wizardFlowVariants };
export type { WizardFlowProps, WizardStep } from "./wizard-flow.types";
export default WizardFlow;

