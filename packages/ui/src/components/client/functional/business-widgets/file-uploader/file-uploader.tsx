/**
 * FileUploader Component - Layer 3 Functional Component
 * @module FileUploader
 * @layer 3
 * @category business-widgets
 */

"use client";

import { ArrowUpTrayIcon, XMarkIcon, DocumentIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { FileUploaderProps, UploadedFile } from "./file-uploader.types";

const fileUploaderVariants = {
  base: ["w-full", "mcp-functional-component"].join(" "),
  dropzone: [
    "border-2 border-dashed",
    colorTokens.border,
    radiusTokens.lg,
    "transition-colors",
  ].join(" "),
  sizes: {
    sm: { padding: "p-4", text: "text-xs" },
    md: { padding: "p-6", text: "text-sm" },
    lg: { padding: "p-8", text: "text-base" },
  },
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUploader({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  size = "md",
  variant = "dropzone",
  disabled = false,
  files = [],
  onFilesChange,
  onFileRemove,
  onUpload,
  dragActiveText = "Drop files here",
  dropzoneText = "Drag & drop files here, or click to select",
  testId,
  className,
}: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sizeConfig = fileUploaderVariants.sizes[size];

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleFiles = React.useCallback((selectedFiles: File[]) => {
    let validFiles = selectedFiles;

    if (maxSize) {
      validFiles = validFiles.filter((f) => f.size <= maxSize);
    }
    if (maxFiles) {
      validFiles = validFiles.slice(0, maxFiles - files.length);
    }

    onFilesChange?.(validFiles);
    onUpload?.(validFiles);
  }, [maxSize, maxFiles, files.length, onFilesChange, onUpload]);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [disabled, handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={cn(fileUploaderVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {/* Dropzone - using button element for accessibility */}
      <button
        type="button"
        disabled={disabled}
        aria-label="File upload dropzone - click or drag files here"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          fileUploaderVariants.dropzone,
          sizeConfig.padding,
          "flex flex-col items-center justify-center cursor-pointer",
          isDragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:outline-primary"
        )}
      >
        <ArrowUpTrayIcon className="h-8 w-8 mb-2 text-muted-foreground" />
        <p className={cn(sizeConfig.text, colorTokens.fgMuted)}>
          {isDragActive ? dragActiveText : dropzoneText}
        </p>
        {maxSize && (
          <p className={cn("text-xs mt-1", colorTokens.fgMuted)}>
            Max file size: {formatFileSize(maxSize)}
          </p>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        aria-label="File input"
      />

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2" role="list" aria-label="Uploaded files">
          {files.map((file) => (
            <li
              key={file.id}
              className={cn(
                "flex items-center gap-3 p-3",
                radiusTokens.md,
                colorTokens.bgMuted
              )}
            >
              <DocumentIcon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={cn("truncate font-medium", sizeConfig.text)}>
                  {file.name}
                </p>
                <p className={cn("text-xs", colorTokens.fgMuted)}>
                  {formatFileSize(file.size)}
                  {file.status === "uploading" && file.progress !== undefined && (
                    <span> • {file.progress}%</span>
                  )}
                  {file.status === "error" && (
                    <span className="text-destructive"> • {file.error}</span>
                  )}
                </p>
              </div>
              {onFileRemove && (
                <button
                  type="button"
                  onClick={() => onFileRemove(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="p-1 hover:bg-muted rounded"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

FileUploader.displayName = "FileUploader";

export { fileUploaderVariants };
export type { FileUploaderProps, UploadedFile } from "./file-uploader.types";
export default FileUploader;

