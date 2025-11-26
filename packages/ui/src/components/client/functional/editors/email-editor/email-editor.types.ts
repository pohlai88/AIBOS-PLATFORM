/**
 * EmailEditor Types - Layer 3 Functional Component
 * @layer 3
 * @category editors
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface EmailEditorProps {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  onToChange: (recipients: EmailRecipient[]) => void;
  onCcChange?: (recipients: EmailRecipient[]) => void;
  onBccChange?: (recipients: EmailRecipient[]) => void;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  onAttach?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  onSend?: () => void;
  onSaveDraft?: () => void;
  testId?: string;
  className?: string;
}

