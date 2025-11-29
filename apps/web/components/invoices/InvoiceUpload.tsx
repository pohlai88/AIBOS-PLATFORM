"use client";

import { useState, useRef, ChangeEvent } from "react";
import type { Invoice } from "@aibos/types";

/**
 * Invoice Upload Component
 * 
 * Allows users to upload invoice files (PDF, JPEG, PNG)
 * and displays upload progress and OCR status.
 * 
 * Features:
 * - Drag and drop file upload
 * - File type validation
 * - Upload progress tracking
 * - OCR status polling
 * - Error handling
 */
export function InvoiceUpload() {
  const [uploading, setUploading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  /**
   * Upload file to BFF endpoint
   */
  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please upload PDF, JPEG, or PNG.");
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File too large. Maximum size is 10MB.");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload to BFF endpoint
      const response = await fetch("/api/invoices/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setInvoice(data.invoice);

      // Start polling for OCR status
      pollOCRStatus(data.invoice.id);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Poll OCR status until completed or failed
   */
  const pollOCRStatus = async (invoiceId: string) => {
    const maxAttempts = 60; // 2 minutes max (2s interval)
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        
        if (!response.ok) {
          clearInterval(interval);
          return;
        }

        const data = await response.json();
        setInvoice(data);

        // Stop polling when OCR completes or fails
        if (data.ocr_status === "completed" || data.ocr_status === "failed") {
          clearInterval(interval);
        }

        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error:", error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
  };

  /**
   * Reset component state
   */
  const reset = () => {
    setInvoice(null);
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Get OCR status badge color
   */
  const getOCRStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Get workflow status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved_to_ap":
        return "bg-purple-100 text-purple-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Invoice</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      {!invoice && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          <div className="space-y-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold text-blue-600">Click to upload</span>{" "}
                  or drag and drop
                </p>
                <p className="text-sm text-gray-500">PDF, JPEG, PNG (max 10MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      {invoice && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {invoice.invoice_number || "Processing..."}
              </h3>
              <p className="text-sm text-gray-500">ID: {invoice.id}</p>
            </div>
            <button
              onClick={reset}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Upload Another
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status.replace(/_/g, " ").toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getOCRStatusColor(
                invoice.ocr_status
              )}`}
            >
              OCR: {invoice.ocr_status.toUpperCase()}
            </span>
            {invoice.is_locked && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                🔒 LOCKED
              </span>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Supplier</p>
              <p className="font-medium">{invoice.supplier_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-medium">
                {invoice.total_amount
                  ? `${invoice.currency} ${invoice.total_amount.toFixed(2)}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Invoice Date</p>
              <p className="font-medium">{invoice.invoice_date || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{invoice.due_date || "—"}</p>
            </div>
          </div>

          {/* OCR Confidence */}
          {invoice.ocr_confidence && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">OCR Confidence</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    invoice.ocr_confidence > 0.8
                      ? "bg-green-500"
                      : invoice.ocr_confidence > 0.6
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${invoice.ocr_confidence * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(invoice.ocr_confidence * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-2">
            <a
              href={`/invoices/${invoice.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Details
            </a>
            {!invoice.is_locked && (
              <a
                href={`/invoices/${invoice.id}/edit`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Edit
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

