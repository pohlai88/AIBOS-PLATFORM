/**
 * WizardFlow Types - Layer 3 Functional Component
 * @module WizardFlowTypes
 * @layer 3
 * @category workflow
 */

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

export interface WizardFlowProps {
  steps: WizardStep[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  onCancel?: () => void;
  showStepIndicator?: boolean;
  allowSkipOptional?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  cancelLabel?: string;
  testId?: string;
  className?: string;
}

