/**
 * Stepper Types - Layer 3 Functional Component
 * @module StepperTypes
 * @layer 3
 * @category workflow
 */

export type StepperSize = "sm" | "md" | "lg";
export type StepperVariant = "default" | "outlined" | "simple";
export type StepperOrientation = "horizontal" | "vertical";
export type StepStatus = "pending" | "current" | "completed" | "error";

export interface Step {
  id: string;
  title: string;
  description?: string;
  status?: StepStatus;
  icon?: React.ReactNode;
  optional?: boolean;
}

export interface StepperProps {
  steps: Step[];
  currentStep?: number;
  size?: StepperSize;
  variant?: StepperVariant;
  orientation?: StepperOrientation;
  onStepClick?: (stepIndex: number) => void;
  allowClickNavigation?: boolean;
  showStepNumbers?: boolean;
  testId?: string;
  className?: string;
}

