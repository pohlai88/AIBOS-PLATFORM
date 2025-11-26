/**
 * MultiStepForm Types - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: React.ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Record<string, unknown>;
  showProgressBar?: boolean;
  submitLabel?: string;
  testId?: string;
  className?: string;
}

