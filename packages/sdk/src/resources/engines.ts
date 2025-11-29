/**
 * Engines API Resource
 */

import type { KernelClient } from "../client";
import type { EngineExecutionRequest, EngineExecutionResult } from "../types";

export interface Engine {
  id: string;
  name: string;
  description?: string;
  version: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export class EnginesAPI {
  constructor(private client: KernelClient) {}

  /**
   * List all available engines
   */
  async list(): Promise<Engine[]> {
    const response = await this.client.request<{ data: Engine[] }>("GET", "/api/engines");
    return response.data;
  }

  /**
   * Get an engine by ID
   */
  async get(id: string): Promise<Engine> {
    return this.client.request<Engine>("GET", `/api/engines/${id}`);
  }

  /**
   * Execute an engine
   */
  async execute(request: EngineExecutionRequest): Promise<EngineExecutionResult> {
    return this.client.request<EngineExecutionResult>("POST", "/api/engines/execute", {
      body: request,
    });
  }

  /**
   * Execute an engine with streaming response
   * 
   * Note: This returns a ReadableStream for server-sent events
   */
  async executeStream(
    request: EngineExecutionRequest
  ): Promise<ReadableStream<string>> {
    const url = new URL("/api/engines/execute/stream", this.client["config"].baseUrl);
    
    const headers = await this.client["buildHeaders"]();
    
    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body.pipeThrough(new TextDecoderStream());
  }

  /**
   * Get execution status
   */
  async getExecution(id: string): Promise<EngineExecutionResult> {
    return this.client.request<EngineExecutionResult>("GET", `/api/engines/executions/${id}`);
  }
}

