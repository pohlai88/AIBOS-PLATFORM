import type { ValidationError } from "../types/ValidationError.js";
import { buildSummary, type ReportSummary } from "./summary.js";
import { generateHTMLReport, type ReportOptions } from "./htmlTemplate.js";
import { renderPDF, isPuppeteerAvailable, type PDFOptions } from "./pdf.js";

export interface ReportOutput {
  html: string;
  pdf?: Buffer;
  summary: ReportSummary;
  generatedAt: Date;
  theme: string;
}

export interface GenerateReportOptions extends ReportOptions {
  asPDF?: boolean;
  pdfOptions?: PDFOptions;
  totalNodes?: number;
}

/**
 * Generate a complete validation report (HTML and optionally PDF).
 */
export async function generateReport(
  errors: ValidationError[],
  theme: string,
  options: GenerateReportOptions = {}
): Promise<ReportOutput> {
  const { asPDF = false, pdfOptions, totalNodes = 0, ...reportOptions } = options;

  const generatedAt = new Date();
  const summary = buildSummary(errors, totalNodes);

  const html = generateHTMLReport(errors, summary, theme, {
    ...reportOptions,
    generatedAt,
  });

  const result: ReportOutput = {
    html,
    summary,
    generatedAt,
    theme,
  };

  if (asPDF) {
    const puppeteerAvailable = await isPuppeteerAvailable();

    if (puppeteerAvailable) {
      result.pdf = await renderPDF(html, pdfOptions);
    } else {
      console.warn(
        "[Designer Reporter] Puppeteer not available. Skipping PDF generation."
      );
    }
  }

  return result;
}

/**
 * Generate HTML report only (synchronous).
 */
export function generateHTMLReportSync(
  errors: ValidationError[],
  theme: string,
  options: ReportOptions = {}
): { html: string; summary: ReportSummary } {
  const summary = buildSummary(errors);
  const html = generateHTMLReport(errors, summary, theme, options);

  return { html, summary };
}

/**
 * Save report to file system.
 */
export async function saveReport(
  report: ReportOutput,
  outputPath: string
): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");

  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  // Determine file type from extension
  const ext = path.extname(outputPath).toLowerCase();

  if (ext === ".pdf" && report.pdf) {
    await fs.writeFile(outputPath, report.pdf);
  } else {
    // Default to HTML
    const htmlPath = ext === ".html" ? outputPath : `${outputPath}.html`;
    await fs.writeFile(htmlPath, report.html, "utf-8");
  }
}

/**
 * Generate a quick summary string for console/logs.
 */
export function generateSummaryText(summary: ReportSummary): string {
  const lines = [
    `📊 Designer Validation Report`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Total Issues: ${summary.total}`,
    `Pass Rate: ${summary.passRate}%`,
    ``,
    `By Severity:`,
    ...Object.entries(summary.bySeverity).map(
      ([sev, count]) => `  • ${sev}: ${count}`
    ),
    ``,
    `By Category:`,
    ...Object.entries(summary.byCategory).map(
      ([cat, count]) => `  • ${cat}: ${count}`
    ),
  ];

  return lines.join("\n");
}

// Re-export types and utilities
export { buildSummary, type ReportSummary } from "./summary.js";
export { generateHTMLReport, type ReportOptions } from "./htmlTemplate.js";
export { renderPDF, type PDFOptions } from "./pdf.js";

