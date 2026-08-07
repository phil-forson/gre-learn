import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { contentHash } from "@/lib/utils";
import { getVocabularyGenerationProvider } from "@/features/generation/providers";
import type { VocabularyEntry, VocabularyLearningContent } from "@/features/vocabulary/types";

/**
 * AI is only skipped when usable learning content is already saved.
 * Failed / incomplete generations may retry on re-add without blocking as a duplicate.
 */
export function hasCachedLearningContent(
  entry: Pick<VocabularyEntry, "content" | "status"> | null | undefined,
): boolean {
  if (!entry?.content) return false;
  if (!entry.content.definitions?.[0]?.text) return false;
  if (!entry.content.memoryHook?.text) return false;
  // Treat successful cards as cached even if later audio fails.
  return (
    entry.status === "ready" ||
    entry.status === "audio_ready" ||
    entry.status === "audio_pending" ||
    entry.status === "audio_failed"
  );
}

/** Failed first attempt, or stuck without content — safe to re-run generation. */
export function shouldRetryGeneration(
  entry: Pick<VocabularyEntry, "content" | "status"> | null | undefined,
): boolean {
  if (!entry) return false;
  if (hasCachedLearningContent(entry)) return false;
  return (
    entry.status === "generation_failed" ||
    entry.status === "pending" ||
    entry.status === "generating" ||
    !entry.content
  );
}

export async function hashLearningContent(
  content: VocabularyLearningContent,
  contentVersion = 1,
): Promise<string> {
  return contentHash([
    content.normalizedWord,
    content.definitions[0]?.text,
    content.memoryHook.text,
    content.etymology.summary,
    content.exampleSentences[0]?.text,
    JSON.stringify(content.synonyms),
    String(contentVersion),
  ]);
}

/**
 * Always calls the configured AI provider. Callers must check cache first.
 */
export async function generateLearningContentFromProvider(
  word: string,
  reason: "initial" | "regenerate",
): Promise<{
  content: VocabularyLearningContent;
  provider: string;
  model: string;
}> {
  const provider = getVocabularyGenerationProvider();
  console.info(
    `[ai] OpenAI call (${reason}) word="${word}" provider=${provider.name} model=${provider.model}`,
  );
  const content = await provider.generate(word);
  console.info(`[ai] OpenAI success word="${content.normalizedWord}"`);
  return {
    content,
    provider: provider.name,
    model: provider.model,
  };
}

export function assertOpenAiReadyForGeneration(): void {
  const env = getEnv();
  if (env.AI_PROVIDER === "openai" && !env.AI_API_KEY) {
    throw new AppError(
      "Add AI_API_KEY to .env.local to generate words with OpenAI.",
      "AI_NOT_CONFIGURED",
      500,
    );
  }
}
