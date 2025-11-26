/**
 * Designer Report Generator
 * Generates HTML and PDF reports for design validation results.
 */

export {
  generateReport,
  generateHTMLReportSync,
  saveReport,
  generateSummaryText,
  type ReportOutput,
  type GenerateReportOptions,
} from "./generateReport.js";

export {
  buildSummary,
  getSeverityColor,
  getSeverityBgColor,
  type ReportSummary,
} from "./summary.js";

export {
  generateHTMLReport,
  type ReportOptions,
} from "./htmlTemplate.js";

export {
  renderPDF,
  isPuppeteerAvailable,
  type PDFOptions,
} from "./pdf.js";

