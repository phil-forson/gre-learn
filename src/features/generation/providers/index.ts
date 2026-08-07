import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import type { VocabularyGenerationProvider } from "./types";
import { MockVocabularyGenerationProvider } from "./mock";
import { OpenAIVocabularyGenerationProvider } from "./openai";

export function getVocabularyGenerationProvider(): VocabularyGenerationProvider {
  const env = getEnv();
  if (env.AI_PROVIDER === "openai") {
    if (!env.AI_API_KEY) {
      throw new AppError(
        "AI_PROVIDER=openai requires AI_API_KEY. Set it in .env.local or use AI_PROVIDER=mock.",
        "AI_NOT_CONFIGURED",
        500,
      );
    }
    return new OpenAIVocabularyGenerationProvider();
  }
  return new MockVocabularyGenerationProvider();
}
