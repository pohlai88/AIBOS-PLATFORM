/**
 * 🧠 LLM Adapter v1.0
 * 
 * Abstracts LLM calls for intent analysis:
 * - Local Ollama support
 * - Remote API fallback
 * - MCP integration ready
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type IntentClassification = "safe" | "risky" | "malicious" | "unknown";

export interface IntentAnalysis {
  intent: IntentClassification;
  confidence: number;
  explanation: string;
  patterns: string[];
}

export interface LLMConfig {
  provider: "ollama" | "openai" | "anthropic" | "local";
  model: string;
  endpoint?: string;
  timeout?: number;
}

// ═══════════════════════════════════════════════════════════
// LLM Adapter
// ═══════════════════════════════════════════════════════════

export class LLMAdapter {
  private static config: LLMConfig = {
    provider: "ollama",
    model: "llama3.2",
    endpoint: "http://localhost:11434",
    timeout: 10000,
  };

  /**
   * Configure the LLM adapter
   */
  static configure(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Analyze code intent using LLM
   */
  static async analyzeIntent(code: string, context: string): Promise<IntentAnalysis> {
    const prompt = this.buildPrompt(code, context);

    try {
      // Try Ollama first
      if (this.config.provider === "ollama") {
        return await this.callOllama(prompt);
      }

      // Fallback to heuristic analysis
      return this.heuristicAnalysis(code);
    } catch (error) {
      // On LLM failure, use heuristic fallback
      // Import logger dynamically to avoid circular dependency
      const { baseLogger } = await import("../observability/logger");
      baseLogger.warn({ error }, "LLM analysis failed, using heuristic fallback");
      return this.heuristicAnalysis(code);
    }
  }

  /**
   * Build analysis prompt
   */
  private static buildPrompt(code: string, context: string): string {
    return `You are an AI kernel security analyzer. Analyze the INTENT of the following code.

Context: ${context}

Code:
\`\`\`
${code.slice(0, 2000)}
\`\`\`

Classify the intent as one of:
- "safe": Normal, expected operations
- "risky": Potentially dangerous but may be legitimate
- "malicious": Clearly harmful or exploitative
- "unknown": Cannot determine intent

Respond in JSON format:
{
  "intent": "safe|risky|malicious|unknown",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation",
  "patterns": ["pattern1", "pattern2"]
}`;
  }

  /**
   * Call Ollama API
   */
  private static async callOllama(prompt: string): Promise<IntentAnalysis> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.endpoint}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          format: "json",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.response);

      return {
        intent: parsed.intent || "unknown",
        confidence: parsed.confidence || 0.5,
        explanation: parsed.explanation || "LLM analysis complete",
        patterns: parsed.patterns || [],
      };
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  /**
   * Heuristic fallback analysis
   */
  private static heuristicAnalysis(code: string): IntentAnalysis {
    const patterns: string[] = [];
    let riskScore = 0;

    // Check for dangerous patterns
    const dangerPatterns = [
      { pattern: /eval\s*\(/i, name: "eval_call", score: 40 },
      { pattern: /Function\s*\(/i, name: "function_constructor", score: 40 },
      { pattern: /child_process/i, name: "child_process", score: 50 },
      { pattern: /process\.exit/i, name: "process_exit", score: 30 },
      { pattern: /__proto__/i, name: "proto_access", score: 45 },
      { pattern: /require\s*\([^'"]/i, name: "dynamic_require", score: 35 },
      { pattern: /while\s*\(\s*true\s*\)/i, name: "infinite_loop", score: 25 },
      { pattern: /fs\.(unlink|rmdir|rm)/i, name: "file_deletion", score: 35 },
      { pattern: /crypto\.createCipher/i, name: "encryption", score: 15 },
      { pattern: /\.repeat\(\d{5,}\)/i, name: "memory_bomb", score: 40 },
    ];

    for (const { pattern, name, score } of dangerPatterns) {
      if (pattern.test(code)) {
        patterns.push(name);
        riskScore += score;
      }
    }

    // Determine intent
    let intent: IntentClassification;
    let explanation: string;

    if (riskScore >= 80) {
      intent = "malicious";
      explanation = "Multiple high-risk patterns detected";
    } else if (riskScore >= 40) {
      intent = "risky";
      explanation = "Potentially dangerous patterns found";
    } else if (riskScore > 0) {
      intent = "unknown";
      explanation = "Minor concerns detected, review recommended";
    } else {
      intent = "safe";
      explanation = "No harmful patterns detected";
    }

    return {
      intent,
      confidence: patterns.length > 0 ? 0.7 : 0.9,
      explanation,
      patterns,
    };
  }
}

export const llmAdapter = LLMAdapter;

