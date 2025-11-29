/**
 * Lynx AI Client
 * 
 * Multi-provider LLM client with fallback chain:
 * 1. PRIMARY: Local LLM (Ollama)
 * 2. SECONDARY: OpenAI
 * 3. TERTIARY: DeepSeek API (TODO)
 * 4. QUATERNARY: Anthropic Claude (TODO)
 * 5. QUINARY: Groq Llama 3 Turbo (TODO)
 */

import { baseLogger } from "../observability/logger";

const LYNX_MODEL = process.env.LYNX_MODEL || "deepseek-r1:7b";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";

// TODO: Add additional fallback providers
// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
// const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
// const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function lynx(prompt: string): Promise<string> {
  // 1. Try local Lynx first (Ollama)
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LYNX_MODEL,
        prompt,
        stream: false
      })
    });

    if (response.ok) {
      const data = (await response.json()) as { response?: string };
      if (data?.response) {
        return data.response;
      }
    }
    baseLogger.warn("⚠️ Lynx (local Ollama) failed. Attempting OpenAI fallback.");
  } catch (err) {
    baseLogger.warn({ err }, "⚠️ Lynx (local Ollama) error");
  }

  // 2. Fallback → OpenAI
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_FALLBACK_MODEL,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (response.ok) {
        const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          baseLogger.info("✅ OpenAI fallback successful.");
          return content;
        }
      }
      baseLogger.warn({ status: response.status }, "⚠️ OpenAI fallback failed: %d", response.status);
    } catch (err) {
      baseLogger.warn({ err }, "⚠️ OpenAI fallback error");
    }
  }

  // TODO: 3. Tertiary fallback → DeepSeek API
  // if (DEEPSEEK_API_KEY) { ... }

  // TODO: 4. Quaternary fallback → Anthropic Claude
  // if (ANTHROPIC_API_KEY) { ... }

  // TODO: 5. Quinary fallback → Groq Llama 3 Turbo
  // if (GROQ_API_KEY) { ... }

  // Final fallback → return safe message (never crash OS)
  return "[Lynx AI: All providers unavailable - governance check skipped]";
}

export async function lynxStream(prompt: string, onChunk: (text: string) => void): Promise<void> {
  // Primary: Ollama streaming
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LYNX_MODEL,
        prompt,
        stream: true
      })
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) onChunk(json.response);
          } catch { }
        }
      }
      return;
    }
  } catch (err) {
    baseLogger.warn("⚠️ Lynx stream failed, falling back to non-stream.");
  }

  // Fallback: non-streaming call
  const result = await lynx(prompt);
  onChunk(result);
}

/**
 * Get current LLM provider status
 */
export async function getLynxStatus(): Promise<{
  ollama: boolean;
  openai: boolean;
  // TODO: Add more providers
}> {
  let ollamaOk = false;
  let openaiOk = false;

  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    ollamaOk = res.ok;
  } catch { }

  if (OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
      });
      openaiOk = res.ok;
    } catch { }
  }

  return { ollama: ollamaOk, openai: openaiOk };
}

