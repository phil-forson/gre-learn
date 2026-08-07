import { getEnv, requireAiKey } from "@/lib/env";
import { AppError } from "@/lib/errors";
import {
  formatLearningContentErrors,
  validateLearningContent,
} from "@/features/vocabulary/schemas/learning-content";
import { normalizeWord } from "@/features/vocabulary/services/normalize";
import type { VocabularyLearningContent } from "@/features/vocabulary/types";
import { VOCABULARY_GENERATION_PROMPT } from "@/features/generation/prompts/vocabulary";
import { vocabularyLearningContentJsonSchema } from "@/features/generation/schemas/json-schema";
import { coerceLearningContent } from "@/features/generation/services/coerce-content";
import type { VocabularyGenerationProvider } from "./types";

export class OpenAIVocabularyGenerationProvider
  implements VocabularyGenerationProvider
{
  readonly name = "openai";
  readonly model: string;

  constructor() {
    this.model = getEnv().AI_MODEL;
  }

  async generate(word: string): Promise<VocabularyLearningContent> {
    const normalized = normalizeWord(word);
    if (!normalized.ok) {
      throw new AppError(normalized.error, "INVALID_WORD", 400);
    }

    const apiKey = requireAiKey();
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const useStrictSchema = attempt < 2;
      const repair =
        attempt === 0
          ? ""
          : `\nYour previous JSON failed app validation: ${lastError}.
Return corrected full JSON only.
Requirements: exactly one definitions[].isPrimary=true; synonyms as [{word, note|null}]; non-empty memoryHook.text; at least one example sentence; confidence enums high|medium|low only.`;

      const body: Record<string, unknown> = {
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: VOCABULARY_GENERATION_PROMPT },
          {
            role: "user",
            content: `Analyze this GRE vocabulary word and return the JSON object.

Word: ${normalized.display}
Normalized: ${normalized.normalized}

Fill every required field. Never fabricate roots. Memory hook must be clearly mnemonic, not etymology.
${repair}`,
          },
        ],
      };

      if (useStrictSchema) {
        body.response_format = {
          type: "json_schema",
          json_schema: {
            name: "vocabulary_learning_content",
            strict: true,
            schema: vocabularyLearningContentJsonSchema,
          },
        };
      } else {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errBody = (await response.json()) as {
            error?: { message?: string; code?: string };
          };
          detail = errBody.error?.message
            ? ` ${errBody.error.message}`
            : ` HTTP ${response.status}`;
          // If strict schema unsupported, fall back on next attempt
          if (
            useStrictSchema &&
            (response.status === 400 ||
              detail.toLowerCase().includes("response_format") ||
              detail.toLowerCase().includes("json_schema"))
          ) {
            lastError = `Structured output rejected:${detail}`;
            continue;
          }
        } catch {
          detail = ` HTTP ${response.status}`;
        }
        throw new AppError(
          `The AI provider is unavailable right now.${detail}`.trim(),
          "AI_PROVIDER_UNAVAILABLE",
          502,
        );
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) {
        lastError = "Empty model response";
        continue;
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(raw);
      } catch {
        lastError = "Model returned non-JSON text";
        continue;
      }

      const coerced = coerceLearningContent(
        parsedJson,
        normalized.display,
        normalized.normalized,
      );

      const validated = validateLearningContent(coerced);
      if (validated.success) {
        return {
          ...validated.data,
          word: normalized.display,
          normalizedWord: normalized.normalized,
          pronunciation: {
            ipa: validated.data.pronunciation.ipa ?? null,
            simple: validated.data.pronunciation.simple ?? null,
            confidence: validated.data.pronunciation.confidence ?? undefined,
          },
          definitions: validated.data.definitions.map((d) => ({
            text: d.text,
            ...(d.sense ? { sense: d.sense } : {}),
            isPrimary: d.isPrimary,
          })),
          memoryHook: validated.data.memoryHook,
          synonyms: validated.data.synonyms.map((s) => ({
            word: s.word,
            note: s.note ?? null,
          })),
          exampleSentences: validated.data.exampleSentences.map((e) => ({
            text: e.text,
            targetSense: e.targetSense ?? null,
          })),
          confusedWith: validated.data.confusedWith.map((c) => ({
            word: c.word,
            distinction: c.distinction ?? null,
          })),
          usageNotes: validated.data.usageNotes ?? null,
        };
      }

      lastError = formatLearningContentErrors(validated.error);
      console.warn(
        `[ai] validation failed attempt=${attempt + 1} word=${normalized.normalized}: ${lastError}`,
      );
    }

    throw new AppError(
      lastError
        ? `Could not validate AI content (${lastError})`
        : "Generated vocabulary content failed validation.",
      "GENERATION_VALIDATION_FAILED",
      502,
      { lastError },
    );
  }
}
