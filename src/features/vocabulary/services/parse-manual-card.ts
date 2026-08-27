import { AppError } from "@/lib/errors";
import {
  formatLearningContentErrors,
  validateLearningContent,
} from "@/features/vocabulary/schemas/learning-content";
import { normalizeWord } from "@/features/vocabulary/services/normalize";
import type { VocabularyLearningContent } from "@/features/vocabulary/types";

export type ManualVocabularyCard = {
  word: string;
  meaning: string;
  commonLink: string;
  breakdown: string;
  memoryTrick: string;
  sentence: string;
};

const FIELD_LABELS = {
  meaning: /^meaning\s*:/i,
  commonLink: /^common\s+link\s*:/i,
  breakdown: /^breakdown\s*:/i,
  memoryTrick: /^memory\s+trick\s*:/i,
  sentence: /^sentence\s*:/i,
} as const;

function stripLabel(line: string, pattern: RegExp): string {
  return line.replace(pattern, "").trim();
}

function parseCardBlock(block: string, index: number): ManualVocabularyCard {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new AppError(
      `Card ${index + 1} is empty.`,
      "INVALID_MANUAL_CARD",
      400,
    );
  }

  const word = lines[0]!;
  const fields: Partial<Record<keyof Omit<ManualVocabularyCard, "word">, string>> =
    {};

  for (const line of lines.slice(1)) {
    for (const [key, pattern] of Object.entries(FIELD_LABELS) as Array<
      [keyof typeof FIELD_LABELS, RegExp]
    >) {
      if (pattern.test(line)) {
        fields[key] = stripLabel(line, pattern);
        break;
      }
    }
  }

  const missing = (
    ["meaning", "commonLink", "breakdown", "memoryTrick", "sentence"] as const
  ).filter((key) => !fields[key]?.trim());

  if (missing.length) {
    const labels = missing
      .map((key) =>
        key === "commonLink"
          ? "Common Link"
          : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      )
      .join(", ");
    throw new AppError(
      `“${word}” is missing required fields: ${labels}.`,
      "INVALID_MANUAL_CARD",
      400,
    );
  }

  return {
    word,
    meaning: fields.meaning!.trim(),
    commonLink: fields.commonLink!.trim(),
    breakdown: fields.breakdown!.trim(),
    memoryTrick: fields.memoryTrick!.trim(),
    sentence: fields.sentence!.trim(),
  };
}

/**
 * Split pasted notes into cards. Blank lines separate entries.
 */
export function parseManualVocabularyCards(raw: string): ManualVocabularyCard[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new AppError("Paste at least one word card.", "INVALID_MANUAL_CARD", 400);
  }

  const blocks = trimmed
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    throw new AppError("Paste at least one word card.", "INVALID_MANUAL_CARD", 400);
  }

  return blocks.map((block, index) => parseCardBlock(block, index));
}

export function buildManualLearningContent(
  card: ManualVocabularyCard,
): VocabularyLearningContent {
  const normalized = normalizeWord(card.word);
  if (!normalized.ok) {
    throw new AppError(normalized.error, "INVALID_WORD", 400);
  }

  const content: VocabularyLearningContent = {
    word: normalized.display,
    normalizedWord: normalized.normalized,
    partOfSpeech: ["unknown"],
    pronunciation: {
      ipa: null,
      simple: null,
      confidence: "low",
    },
    definitions: [
      {
        text: card.meaning,
        isPrimary: true,
      },
    ],
    etymology: {
      summary: card.breakdown,
      isUsefulForRootLearning: true,
      uncertaintyNote: null,
      components: [],
    },
    memoryHook: {
      text: card.memoryTrick,
      type: "other",
    },
    synonyms: [
      {
        word: card.commonLink,
        note: "Common link",
      },
    ],
    antonyms: [],
    exampleSentences: [
      {
        text: card.sentence,
      },
    ],
    wordFamily: [],
    usageNotes: null,
    confusedWith: [],
  };

  const parsed = validateLearningContent(content);
  if (!parsed.success) {
    throw new AppError(
      formatLearningContentErrors(parsed.error),
      "INVALID_MANUAL_CARD",
      400,
    );
  }

  return parsed.data as VocabularyLearningContent;
}
