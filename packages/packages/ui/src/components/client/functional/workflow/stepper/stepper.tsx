/**
 * Stepper Component - Layer 3 Functional Component
 * @module Stepper
 * @layer 3
 * @category workflow
 */

"use client";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import * as React from "react";

import {
  colorTokens,
  radiusTokens,
  spacingTokens,
} from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { StepperProps, Step, StepStatus } from "./stepper.types";

const stepperVariants = {
  base: ["w-full", "mcp-functional-component"].join(" "),
  sizes: {
    sm: { icon: "h-6 w-6 text-xs", text: "text-xs" },
    md: { icon: "h-8 w-8 text-sm", text: "text-sm" },
    lg: { icon: "h-10 w-10 text-base", text: "text-base" },
  },
};

const statusStyles: Record<StepStatus, string> = {
  pending: cn(colorTokens.bgMuted, colorTokens.fgMuted, "border-2 border-muted"),
  current: cn("bg-primary text-primary-foreground", "border-2 border-primary"),
  completed: cn("bg-success text-success-foreground"),
  error: cn("bg-destructive text-destructive-foreground"),
};

export function Stepper({
  steps,
  currentStep = 0,
  size = "md",
  variant = "default",
  orientation = "horizontal",
  onStepClick,
  allowClickNavigation = false,
  showStepNumbers = true,
  testId,
  className,
}: StepperProps) {
  const sizeConfig = stepperVariants.sizes[size];
  const isVertical = orientation === "vertical";

  const getStepStatus = (index: number, step: Step): StepStatus => {
    if (step.status) return step.status;
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  const handleStepClick = (index: number) => {
    if (allowClickNavigation && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <nav
      aria-label="Progress"
      className={cn(stepperVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      <ol
        role="list"
        className={cn(
          "flex",
          isVertical ? "flex-col gap-4" : "items-center justify-between"
        )}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index, step);
          const isClickable = allowClickNavigation && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn(
                "relative",
                !isVertical && !isLast && "flex-1",
                isVertical && "flex items-start gap-3"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  !isVertical && "flex-col",
                  isVertical && "flex-row gap-3"
                )}
              >
                {/* Step indicator */}
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  aria-current={status === "current" ? "step" : undefined}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-colors",
                    sizeConfig.icon,
                    statusStyles[status],
                    isClickable && "cursor-pointer hover:opacity-80",
                    !isClickable && "cursor-default",
                    "focus-visible:outline-2 focus-visible:outline-primary"
                  )}
                >
                  {status === "completed" ? (
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  ) : status === "error" ? (
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  ) : showStepNumbers ? (
                    <span>{index + 1}</span>
                  ) : (
                    step.icon
                  )}
                  <span className="sr-only">
                    Step {index + 1}: {step.title} - {status}
                  </span>
                </button>

                {/* Step content */}
                <div className={cn(!isVertical && "mt-2 text-center")}>
                  <span
                    className={cn(
                      "font-medium",
                      sizeConfig.text,
                      status === "current" ? colorTokens.fg : colorTokens.fgMuted
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <p className={cn("text-xs", colorTokens.fgMuted)}>
                      {step.description}
                    </p>
                  )}
                  {step.optional && (
                    <span className={cn("text-xs", colorTokens.fgMuted)}>
                      (Optional)
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && !isVertical && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2",
                    index < currentStep ? "bg-primary" : colorTokens.bgMuted
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Stepper.displayName = "Stepper";

export { stepperVariants };
export type { StepperProps, Step, StepStatus } from "./stepper.types";
export default Stepper;

