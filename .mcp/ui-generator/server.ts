// .mcp/ui-generator/server.ts
// NOTE: This is a template/example MCP server implementation.
// The dependencies (@ai-sdk/openai, ai) are optional and should be installed
// if you plan to use this server. For TypeScript checking, .mcp is excluded in tsconfig.json.

// @ts-ignore - Optional dependency, may not be installed
import { createOpenAI } from "@ai-sdk/openai"; // or your preferred client
// @ts-ignore - Optional dependency, may not be installed
import { Message } from "ai"; // adjust to your actual types

// Use generated prompt file (synced from tools/MCP_SYSTEM_PROMPT.md)
import { UI_GENERATOR_SYSTEM_PROMPT } from "./systemPrompt.generated";

// Fallback: load directly if generated file doesn't exist
export function loadUiGeneratorSystemPrompt(): string {
  try {
    return UI_GENERATOR_SYSTEM_PROMPT;
  } catch (err) {
    console.error(
      `[UI-GENERATOR] Failed to load system prompt. Run 'pnpm sync-mcp-prompt' first.`,
      err,
    );
    throw err;
  }
}

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function runUiGeneratorAgent(
  userMessages: Message[],
) {
  const systemPrompt = loadUiGeneratorSystemPrompt();

  const messages: Message[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...userMessages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5.1-thinking", // or whatever model you use
    messages,
    temperature: 0.2,
  });

  // Adapt to your MCP response format
  return response.choices[0]?.message?.content ?? "";
}
