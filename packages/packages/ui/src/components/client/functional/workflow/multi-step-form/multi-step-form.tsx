/**
 * MultiStepForm Component - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { MultiStepFormProps } from "./multi-step-form.types";

const formVariants = {
  base: ["w-full", "mcp-functional-component"].join(" "),
  progress: ["h-2 w-full mb-6", colorTokens.bgMuted, radiusTokens.full, "overflow-hidden"].join(" "),
  footer: ["flex justify-between pt-4 mt-6 border-t", colorTokens.border].join(" "),
  button: ["px-4 py-2 text-sm font-medium", radiusTokens.md, "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

export function MultiStepForm({
  steps,
  onSubmit,
  onCancel,
  showProgressBar = true,
  submitLabel = "Submit",
  testId,
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (step?.validate) {
      const valid = await step.validate();
      if (!valid) return;
    }
    if (isLast) {
      setIsSubmitting(true);
      await onSubmit({});
      setIsSubmitting(false);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => setCurrentStep((s) => s - 1);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleNext(); }}
      className={cn(formVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {/* Progress bar */}
      {showProgressBar && (
        <div className={formVariants.progress} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Step indicator */}
      <div className="mb-4">
        <span className={cn("text-xs", colorTokens.fgMuted)}>Step {currentStep + 1} of {steps.length}</span>
        <h2 className={cn("text-lg font-semibold", colorTokens.fg)}>{step?.title}</h2>
        {step?.description && <p className={cn("text-sm", colorTokens.fgMuted)}>{step.description}</p>}
      </div>

      {/* Fields */}
      <div className="min-h-[200px]">{step?.fields}</div>

      {/* Footer */}
      <div className={formVariants.footer}>
        <div>
          {onCancel && (
            <button type="button" onClick={onCancel} className={cn(formVariants.button, colorTokens.fgMuted, "hover:bg-muted")}>
              Cancel
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {!isFirst && (
            <button type="button" onClick={handleBack} className={cn(formVariants.button, colorTokens.bgMuted)}>
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(formVariants.button, "bg-primary text-primary-foreground", isSubmitting && "opacity-50")}
          >
            {isSubmitting ? "Submitting..." : isLast ? submitLabel : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
}

MultiStepForm.displayName = "MultiStepForm";
export { formVariants };
export type { MultiStepFormProps, FormStep } from "./multi-step-form.types";
export default MultiStepForm;

