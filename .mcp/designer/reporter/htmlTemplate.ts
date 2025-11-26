import type { ValidationError } from "../types/ValidationError.js";
import type { ReportSummary } from "./summary.js";
import { getSeverityColor, getSeverityBgColor } from "./summary.js";

export interface ReportOptions {
  title?: string;
  subtitle?: string;
  logo?: string;
  generatedAt?: Date;
  includeDetails?: boolean;
}

/**
 * Generate a complete HTML report from validation errors.
 */
export function generateHTMLReport(
  errors: ValidationError[],
  summary: ReportSummary,
  theme: string,
  options: ReportOptions = {}
): string {
  const {
    title = "AI-BOS Designer Validation Report",
    subtitle,
    logo,
    generatedAt = new Date(),
    includeDetails = true,
  } = options;

  const rows = errors
    .map((e, idx) => {
      const severityColor = getSeverityColor(e.severity);
      const severityBg = getSeverityBgColor(e.severity);

      return `
      <tr class="error-row" style="background: ${idx % 2 === 0 ? "#fff" : "#f9fafb"}">
        <td class="code" style="font-family: monospace; font-weight: 600; color: ${severityColor}">${e.code}</td>
        <td style="max-width: 400px">${escapeHtml(e.message)}</td>
        <td style="font-family: monospace; font-size: 12px; color: #6b7280">${e.nodeId}</td>
        <td><span class="badge">${e.nodeType}</span></td>
        <td>
          <span class="severity-badge" style="background: ${severityBg}; color: ${severityColor}">
            ${e.severity}
          </span>
        </td>
      </tr>`;
    })
    .join("\n");

  const summaryBySeverityHtml = Object.entries(summary.bySeverity)
    .map(([sev, count]) => {
      const color = getSeverityColor(sev);
      return `<div class="stat-item">
        <span class="stat-label">${capitalize(sev)}</span>
        <span class="stat-value" style="color: ${color}">${count}</span>
      </div>`;
    })
    .join("");

  const summaryByCategoryHtml = Object.entries(summary.byCategory)
    .map(([cat, count]) => `<li><strong>${cat}:</strong> ${count}</li>`)
    .join("");

  const summaryByNodeTypeHtml = Object.entries(summary.byNodeType)
    .map(([node, count]) => `<li><strong>${node}:</strong> ${count}</li>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      ${getReportStyles(theme)}
    </style>
  </head>
  <body>
    <div class="container">
      <header class="report-header">
        ${logo ? `<img src="${logo}" alt="Logo" class="logo" />` : ""}
        <div class="header-text">
          <h1>${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
          <p class="meta">
            Theme: <strong>${escapeHtml(theme)}</strong> • 
            Generated: <strong>${generatedAt.toLocaleString()}</strong>
          </p>
        </div>
      </header>

      <section class="summary-section">
        <h2>Summary</h2>
        
        <div class="summary-grid">
          <div class="summary-card ${summary.criticalCount > 0 ? "has-errors" : "all-pass"}">
            <div class="summary-card-title">Status</div>
            <div class="summary-card-value">
              ${summary.criticalCount === 0 ? "✓ Passed" : "✗ Issues Found"}
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-card-title">Total Issues</div>
            <div class="summary-card-value">${summary.total}</div>
          </div>
          
          <div class="summary-card">
            <div class="summary-card-title">Pass Rate</div>
            <div class="summary-card-value">${summary.passRate}%</div>
          </div>
          
          <div class="summary-card">
            <div class="summary-card-title">Critical</div>
            <div class="summary-card-value" style="color: ${getSeverityColor("error")}">${summary.criticalCount}</div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stats-group">
            <h3>By Severity</h3>
            <div class="stat-items">${summaryBySeverityHtml}</div>
          </div>
        </div>

        <div class="breakdown-row">
          <div class="breakdown-group">
            <h3>By Category</h3>
            <ul>${summaryByCategoryHtml || "<li>No issues</li>"}</ul>
          </div>
          <div class="breakdown-group">
            <h3>By Node Type</h3>
            <ul>${summaryByNodeTypeHtml || "<li>No issues</li>"}</ul>
          </div>
        </div>
      </section>

      ${
        includeDetails && errors.length > 0
          ? `
      <section class="details-section">
        <h2>Detailed Issues (${errors.length})</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Message</th>
                <th>Node ID</th>
                <th>Type</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </section>
      `
          : ""
      }

      <footer class="report-footer">
        <p>Generated by AI-BOS Designer MCP v3.0.0</p>
        <p class="footer-meta">© ${new Date().getFullYear()} AI-BOS Platform</p>
      </footer>
    </div>
  </body>
</html>`;
}

/**
 * Get CSS styles for the report, with theme support.
 */
function getReportStyles(theme: string): string {
  // Theme-specific colors
  const themeColors: Record<string, { primary: string; accent: string }> = {
    default: { primary: "#2563eb", accent: "#3b82f6" },
    dlbb: { primary: "#059669", accent: "#10b981" },
    "client-template": { primary: "#7c3aed", accent: "#8b5cf6" },
  };

  const colors = themeColors[theme] || themeColors.default;

  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      color: #111827;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
    }

    .report-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid ${colors.primary};
    }

    .logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }

    .header-text h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .meta {
      font-size: 14px;
      color: #9ca3af;
    }

    .meta strong {
      color: #374151;
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .summary-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .summary-card.all-pass {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
    }

    .summary-card.has-errors {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .summary-card-title {
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .summary-card-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }

    .stats-row {
      margin-bottom: 20px;
    }

    .stat-items {
      display: flex;
      gap: 24px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
    }

    .breakdown-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .breakdown-group ul {
      list-style: none;
      font-size: 14px;
    }

    .breakdown-group li {
      padding: 4px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .details-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    th {
      text-align: left;
      padding: 12px;
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: #e5e7eb;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .severity-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .report-footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 13px;
    }

    .footer-meta {
      margin-top: 4px;
      font-size: 12px;
    }

    @media print {
      body {
        background: white;
      }
      .container {
        padding: 20px;
      }
      .summary-section,
      .details-section {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .breakdown-row {
        grid-template-columns: 1fr;
      }
    }
  `;
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Capitalize first letter.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

