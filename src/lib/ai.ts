import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// claude-sonnet-4-6 — most capable, used for analysis + generation
export const defaultModel = anthropic("claude-sonnet-4-6");

// claude-haiku-4-5 — fast + cheap, used for simple/quick tasks
export const fastModel = anthropic("claude-haiku-4-5-20251001");

/**
 * Anthropic prompt caching helper.
 * Wrap a system prompt string with this to mark it as cacheable (ephemeral, up to 1hr TTL).
 * Use on long, stable system prompts (resume text, gap context, mentor system prompt)
 * to get up to 90% cost reduction on repeated calls.
 *
 * Usage with generateObject / streamText:
 *   system: cachedSystem(buildResumeAnalysisPrompt(text, role))
 *   → pass as `messages` with providerOptions instead (see cachedMessages helper)
 */
export function cachedSystemMessage(content: string) {
  return {
    role: "system" as const,
    content,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
    },
  };
}
