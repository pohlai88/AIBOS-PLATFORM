#!/usr/bin/env node
/**
 * Generate .cursor/mcp.json with all registered MCP servers
 *
 * Usage: node .mcp/scripts/generate-mcp-config.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../");
const mcpDir = path.join(workspaceRoot, ".mcp");
const outputPath = path.join(workspaceRoot, ".cursor", "mcp.json");

// Load .env.local if it exists
const envLocalPath = path.join(workspaceRoot, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    }
  });
}

// Local MCP servers (in .mcp directory)
// NOTE: ui-generator and designer were removed as duplicates (see MCP_AUDIT_REPORT.md)
const localServers = [
  "a11y",
  "component-generator", // Kept: More comprehensive than ui-generator (86 rules)
  "convention-validation",
  "design-elegance-validator", // Validates design system against Cockpit Elegance Standards
  // "designer",  // REMOVED: Duplicate of landing-page-engine (legacy)
  "documentation",
  "filesystem",
  "landing-page-engine", // Kept: Newer and more AI-BOS specific than designer
  "react",
  "theme",
  "ui-testing", // UI package testing - test generation, coverage validation, pattern checking
  // "ui-generator",  // REMOVED: Duplicate of component-generator (legacy)
];

// External MCP servers (npx packages)
const externalServers = [
  {
    name: "next-devtools",
    command: "npx",
    args: ["-y", "next-devtools-mcp@latest"],
  },
  {
    name: "mcp-git",
    command: "npx",
    args: ["-y", "mcp-git@latest"],
  },
  {
    name: "mcp-tests",
    command: "npx",
    args: ["-y", "mcp-tests@latest"],
  },
  {
    name: "github",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
  },
  {
    name: "playwright",
    command: "npx",
    args: ["-y", "@executeautomation/playwright-mcp-server"],
  },
];

// Build mcpServers object
const mcpServers = {};

// Add local servers
for (const serverName of localServers) {
  const serverPath = path.join(mcpDir, serverName, "server.mjs");

  // Check if server exists
  if (fs.existsSync(serverPath)) {
    const serverId = `aibos-${serverName.replace(/-/g, "-")}`;
    mcpServers[serverId] = {
      command: "node",
      args: [`.mcp/${serverName}/server.mjs`],
      cwd: ".",
    };
    console.log(`✅ Registered: ${serverId}`);
  } else {
    console.warn(`⚠️  Server not found: ${serverPath}`);
  }
}

// Add external servers
for (const server of externalServers) {
  const serverConfig = {
    command: server.command,
    args: server.args,
  };

  // Add GitHub token to GitHub MCP server if available
  if (server.name === "github") {
    const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    if (githubToken) {
      serverConfig.env = {
        GITHUB_PERSONAL_ACCESS_TOKEN: githubToken,
      };
      console.log(`✅ Registered: ${server.name} (with token)`);
    } else {
      console.log(
        `⚠️  Registered: ${server.name} (no token - set GITHUB_PERSONAL_ACCESS_TOKEN)`
      );
    }
  } else {
    console.log(`✅ Registered: ${server.name}`);
  }

  mcpServers[server.name] = serverConfig;
}

// Create output object
const output = {
  mcpServers,
};

// Ensure .cursor directory exists
const cursorDir = path.dirname(outputPath);
if (!fs.existsSync(cursorDir)) {
  fs.mkdirSync(cursorDir, { recursive: true });
}

// Write mcp.json
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`\n✅ Generated: ${outputPath}`);
console.log(`📊 Total servers: ${Object.keys(mcpServers).length}`);
console.log(`\n💡 Restart Cursor to load the new MCP servers.`);
