/**
 * PDF Report Generator
 * Uses Puppeteer to convert HTML reports to PDF.
 */

export interface PDFOptions {
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

/**
 * Render HTML to PDF using Puppeteer.
 * Note: Requires puppeteer to be installed.
 */
export async function renderPDF(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const {
    format = "A4",
    landscape = false,
    margin = { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    printBackground = true,
    displayHeaderFooter = false,
    headerTemplate,
    footerTemplate,
  } = options;

  // Dynamic import to avoid bundling puppeteer if not used
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    throw new Error(
      "Puppeteer is required for PDF generation. Install with: pnpm add puppeteer"
    );
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for styles to load
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Generate PDF
    const pdf = await page.pdf({
      format,
      landscape,
      margin,
      printBackground,
      displayHeaderFooter,
      headerTemplate,
      footerTemplate,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Check if Puppeteer is available.
 */
export async function isPuppeteerAvailable(): Promise<boolean> {
  try {
    await import("puppeteer");
    return true;
  } catch {
    return false;
  }
}

