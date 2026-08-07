import type { VocabularyLearningContent } from "@/features/vocabulary/types";

export interface VocabularyGenerationProvider {
  generate(word: string): Promise<VocabularyLearningContent>;
  readonly name: string;
  readonly model: string;
}
