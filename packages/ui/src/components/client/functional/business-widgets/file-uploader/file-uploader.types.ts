/**
 * FileUploader Types - Layer 3 Functional Component
 * @module FileUploaderTypes
 * @layer 3
 * @category business-widgets
 */

export type FileUploaderSize = "sm" | "md" | "lg";
export type FileUploaderVariant = "default" | "dropzone" | "compact";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  error?: string;
}

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  size?: FileUploaderSize;
  variant?: FileUploaderVariant;
  disabled?: boolean;
  files?: UploadedFile[];
  onFilesChange?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  onUpload?: (files: File[]) => Promise<void>;
  dragActiveText?: string;
  dropzoneText?: string;
  testId?: string;
  className?: string;
}

