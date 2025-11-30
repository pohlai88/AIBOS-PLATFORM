#!/usr/bin/env node
// .mcp/landing-page-engine/scripts/update-mcp-config.mjs
// Script to update .cursor/mcp.json with Landing Page Engine MCP Server

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../../");
const mcpConfigPath = path.join(workspaceRoot, ".cursor", "mcp.json");

async function updateMCPConfig() {
  console.log("📝 Updating MCP Configuration for Landing Page Engine...\n");

  try {
    // Read existing config
    let config = {};
    try {
      const content = await fs.readFile(mcpConfigPath, "utf-8");
      config = JSON.parse(content);
    } catch (error) {
      console.log("⚠️  mcp.json not found, creating new file...");
      config = { mcpServers: {} };
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    const serverConfig = {
      command: "node",
      args: [".mcp/landing-page-engine/server.mjs"],
    };

    // Check if already exists
    if (config.mcpServers["aibos-landing-page-engine"]) {
      console.log("⚠️  aibos-landing-page-engine already exists in config");
      console.log(
        "   Current config:",
        JSON.stringify(config.mcpServers["aibos-landing-page-engine"], null, 2)
      );
      console.log("   New config:", JSON.stringify(serverConfig, null, 2));

      // Update it
      config.mcpServers["aibos-landing-page-engine"] = serverConfig;
      console.log("   ✅ Updated existing configuration\n");
    } else {
      config.mcpServers["aibos-landing-page-engine"] = serverConfig;
      console.log("✅ Added aibos-landing-page-engine to MCP configuration\n");
    }

    // Write updated config
    await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2), "utf-8");
    console.log("✅ MCP configuration updated successfully!");
    console.log(`   Location: ${mcpConfigPath}\n`);

    // Show current servers
    console.log("📋 Current MCP Servers:");
    Object.keys(config.mcpServers).forEach((name) => {
      console.log(`   - ${name}`);
    });
    console.log("");
  } catch (error) {
    console.error("❌ Error updating MCP configuration:", error.message);
    process.exit(1);
  }
}

updateMCPConfig();
