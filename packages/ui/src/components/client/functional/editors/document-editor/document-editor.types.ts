/**
 * DocumentEditor Types - Layer 3 Functional Component
 * @layer 3
 * @category editors
 */

export interface DocumentMetadata {
  title: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
}

export interface DocumentEditorProps {
  content: string;
  metadata: DocumentMetadata;
  onChange: (content: string) => void;
  onMetadataChange?: (metadata: DocumentMetadata) => void;
  onSave?: () => void;
  onExport?: (format: "pdf" | "docx" | "html") => void;
  readOnly?: boolean;
  testId?: string;
  className?: string;
}

