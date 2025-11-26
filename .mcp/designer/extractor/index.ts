import fs from "fs";
import path from "path";
import { parseComponent } from "./parseComponent.js";
import type { DesignNode } from "../types/DesignNode.js";

/**
 * Extract DesignNode[] from a React component file.
 * Parses TSX/JSX and converts to Designer MCP format.
 */
export async function extractDesignNodesFromComponent(
  componentPath: string
): Promise<DesignNode[]> {
  const fullPath = path.resolve(process.cwd(), componentPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Component file not found: ${fullPath}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf-8");
  return parseComponent(fileContents, componentPath);
}

/**
 * Extract DesignNode[] from raw component source code.
 */
export function extractDesignNodesFromSource(
  source: string,
  filename = "component.tsx"
): DesignNode[] {
  return parseComponent(source, filename);
}

/**
 * Batch extract from multiple component files.
 */
export async function extractDesignNodesFromDirectory(
  dirPath: string,
  extensions = [".tsx", ".jsx"]
): Promise<Map<string, DesignNode[]>> {
  const results = new Map<string, DesignNode[]>();
  const fullDirPath = path.resolve(process.cwd(), dirPath);

  if (!fs.existsSync(fullDirPath)) {
    throw new Error(`Directory not found: ${fullDirPath}`);
  }

  const files = fs.readdirSync(fullDirPath, { recursive: true }) as string[];

  for (const file of files) {
    const ext = path.extname(file);
    if (extensions.includes(ext)) {
      const filePath = path.join(fullDirPath, file);
      try {
        const nodes = await extractDesignNodesFromComponent(filePath);
        results.set(file, nodes);
      } catch (err) {
        console.error(`Failed to extract from ${file}:`, err);
      }
    }
  }

  return results;
}

export { parseComponent } from "./parseComponent.js";
export { parseTailwind } from "./parseTailwind.js";
export { parseInlineStyles } from "./parseInlineStyles.js";
export { parseJSX } from "./parseJSX.js";

