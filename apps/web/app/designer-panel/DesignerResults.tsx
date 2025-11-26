"use client";

import { useDesignerMCP } from "./useDesignerMCP";

export default function DesignerResults() {
  const { results, summary } = useDesignerMCP();

  if (!results) return null;

  return (
    <div className="border border-[var(--border-color)] rounded-lg p-6 bg-[var(--surface-bg-elevated)]">
      <h2 className="text-xl mb-4 font-medium text-[var(--text-fg)]">
        Validation Results
      </h2>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Status"
            value={summary.valid ? "✓ Valid" : "✗ Invalid"}
            variant={summary.valid ? "success" : "danger"}
          />
          <SummaryCard
            label="Errors"
            value={summary.errorCount}
            variant={summary.errorCount > 0 ? "danger" : "default"}
          />
          <SummaryCard
            label="Warnings"
            value={summary.warningCount}
            variant={summary.warningCount > 0 ? "warning" : "default"}
          />
          <SummaryCard
            label="Info"
            value={summary.infoCount}
            variant="default"
          />
        </div>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-fg-muted)]">
          ✓ No issues found. Design passes all validation rules.
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {results.map((err, idx) => (
            <ResultItem key={idx} error={err} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-[var(--surface-bg-muted)] text-[var(--text-fg)]",
    success: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className={`rounded-lg p-4 ${variantStyles[variant]}`}>
      <div className="text-xs font-medium opacity-70 mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function ResultItem({ error }: { error: any }) {
  const severityStyles = {
    error: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
    warning: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10",
    info: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10",
  };

  const severity = error.severity as keyof typeof severityStyles;

  return (
    <div
      className={`border-l-4 rounded-r-lg p-4 ${severityStyles[severity] || severityStyles.info}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-[var(--text-fg)] mb-1">
            {error.code}
          </div>
          <div className="text-sm text-[var(--text-fg)]">{error.message}</div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            severity === "error"
              ? "bg-red-100 text-red-700"
              : severity === "warning"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {error.severity}
        </span>
      </div>
      <div className="text-xs text-[var(--text-fg-muted)] mt-2">
        Node: {error.nodeId} ({error.nodeType})
        {error.parentId && ` • Parent: ${error.parentId}`}
      </div>
    </div>
  );
}

