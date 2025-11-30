/**
 * E2E Test Helpers
 * 
 * Utilities for end-to-end MCP testing
 */

import { spawn, type ChildProcess } from 'child_process';
// Note: MCP SDK imports will be uncommented when MCP server is implemented
// import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createTestMCPClient, closeMCPClient } from './test-mcp-client';

// Placeholder type for now
type Client = any;

let mcpServerProcess: ChildProcess | null = null;
let mcpClient: Client | null = null;

/**
 * Start MCP server for E2E tests
 */
export async function startMCPServer(
  serverPath: string = 'metadata/mcp/server.mjs'
): Promise<ChildProcess> {
  if (mcpServerProcess) {
    return mcpServerProcess;
  }

  mcpServerProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    mcpServerProcess!.stdout?.on('data', (data) => {
      if (data.toString().includes('ready') || data.toString().includes('listening')) {
        resolve(undefined);
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(resolve, 5000);
  });

  return mcpServerProcess;
}

/**
 * Stop MCP server
 */
export async function stopMCPServer(): Promise<void> {
  if (mcpServerProcess) {
    mcpServerProcess.kill();
    mcpServerProcess = null;
  }
  
  if (mcpClient) {
    await closeMCPClient(mcpClient);
    mcpClient = null;
  }
}

/**
 * Get or create MCP client for E2E tests
 */
export async function getE2EMCPClient(): Promise<Client> {
  if (mcpClient) {
    return mcpClient;
  }

  mcpClient = await createTestMCPClient();
  return mcpClient;
}

/**
 * Cleanup E2E test resources
 */
export async function cleanupE2ETests(): Promise<void> {
  await stopMCPServer();
}

