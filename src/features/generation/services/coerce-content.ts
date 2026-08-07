import type { VocabularyLearningContent } from "@/features/vocabulary/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return fallback;
  return String(value).trim();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      const rec = asRecord(item);
      if (rec?.word) return asString(rec.word);
      if (rec?.text) return asString(rec.text);
      return "";
    })
    .filter(Boolean);
}

function conf(value: unknown): "high" | "medium" | "low" {
  const s = asString(value).toLowerCase();
  if (s === "high" || s === "medium" || s === "low") return s;
  return "medium";
}

function confOpt(value: unknown): "high" | "medium" | "low" | undefined {
  if (value == null || value === "") return undefined;
  return conf(value);
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Soft-coerce messy model output into the shape our Zod schema expects.
 * Fixes common AI drift: string synonyms, missing isPrimary, wrong enums, etc.
 */
export function coerceLearningContent(
  input: unknown,
  word: string,
  normalizedWord: string,
): VocabularyLearningContent {
  const root = asRecord(input) ?? {};
  const nested =
    asRecord(root.data) ??
    asRecord(root.result) ??
    asRecord(root.content) ??
    root;

  const partOfSpeech = asStringArray(nested.partOfSpeech);
  const pronunciation = asRecord(nested.pronunciation) ?? {};
  const definitionsRaw = Array.isArray(nested.definitions)
    ? nested.definitions
    : [];

  let definitions = definitionsRaw
    .map((item) => {
      const rec = asRecord(item);
      const text = clip(
        asString(rec?.text ?? rec?.definition ?? item),
        500,
      );
      if (!text) return null;
      return {
        text,
        sense: asString(rec?.sense) || undefined,
        isPrimary: Boolean(rec?.isPrimary),
      };
    })
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  if (!definitions.length) {
    const fallback =
      asString(nested.definition) ||
      asString(nested.primaryDefinition) ||
      `A GRE-relevant meaning of ${normalizedWord}.`;
    definitions = [{ text: clip(fallback, 500), sense: undefined, isPrimary: true }];
  }

  const primaryCount = definitions.filter((d) => d.isPrimary).length;
  if (primaryCount === 0) {
    definitions = definitions.map((d, i) => ({ ...d, isPrimary: i === 0 }));
  } else if (primaryCount > 1) {
    let seen = false;
    definitions = definitions.map((d) => {
      if (d.isPrimary && !seen) {
        seen = true;
        return d;
      }
      return { ...d, isPrimary: false };
    });
  }

  const etymologyRec = asRecord(nested.etymology) ?? {};
  const componentsRaw = Array.isArray(etymologyRec.components)
    ? etymologyRec.components
    : [];
  const components = componentsRaw
    .map((item) => {
      const rec = asRecord(item);
      if (!rec) return null;
      const text = asString(rec.text);
      const meaning = asString(rec.meaning);
      const explanation = asString(rec.explanation) || meaning;
      if (!text || !meaning) return null;
      const typeRaw = asString(rec.type).toLowerCase();
      const typeCandidates = [
        "prefix",
        "root",
        "stem",
        "suffix",
        "other",
      ] as const;
      const type = typeCandidates.includes(
        typeRaw as (typeof typeCandidates)[number],
      )
        ? (typeRaw as (typeof typeCandidates)[number])
        : "other";
      return {
        text,
        type,
        origin: asString(rec.origin) || null,
        meaning: clip(meaning, 200),
        explanation: clip(explanation, 400),
        relatedWords: asStringArray(
          Array.isArray(rec.relatedWords)
            ? rec.relatedWords
            : typeof rec.relatedWords === "string"
              ? rec.relatedWords.split(/[,;]/).map((s) => s.trim())
              : [],
        ).slice(0, 12),
        confidence: conf(rec.confidence),
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 8);

  const memoryRec = asRecord(nested.memoryHook) ?? asRecord(nested.mnemonic) ?? {};
  const memoryText =
    asString(memoryRec.text) ||
    (typeof nested.memoryHook === "string"
      ? asString(nested.memoryHook)
      : "") ||
    `Link “${word}” to a vivid GRE image for recall.`;
  const memoryTypeRaw = asString(memoryRec.type).toLowerCase();
  const memoryType = (
    ["visual", "sound", "story", "wordplay", "other"] as const
  ).includes(memoryTypeRaw as "visual")
    ? (memoryTypeRaw as "visual" | "sound" | "story" | "wordplay" | "other")
    : "visual";

  const synonymsRaw = Array.isArray(nested.synonyms) ? nested.synonyms : [];
  let synonyms = synonymsRaw
    .map((item) => {
      if (typeof item === "string") {
        const w = item.trim();
        return w ? { word: w, note: null as string | null } : null;
      }
      const rec = asRecord(item);
      const w = asString(rec?.word ?? rec?.text);
      if (!w) return null;
      return {
        word: w,
        note: asString(rec?.note) || null,
      };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 12);

  if (!synonyms.length) {
    synonyms = [{ word: "related", note: "placeholder" }];
  }

  const examplesRaw = Array.isArray(nested.exampleSentences)
    ? nested.exampleSentences
    : Array.isArray(nested.examples)
      ? nested.examples
      : [];
  let exampleSentences = examplesRaw
    .map((item) => {
      if (typeof item === "string") {
        const t = clip(item.trim(), 400);
        return t ? { text: t, targetSense: null as string | null } : null;
      }
      const rec = asRecord(item);
      const text = clip(asString(rec?.text ?? rec?.sentence), 400);
      if (!text) return null;
      return {
        text,
        targetSense: asString(rec?.targetSense) || null,
      };
    })
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .slice(0, 5);

  if (!exampleSentences.length) {
    exampleSentences = [
      {
        text: `The GRE passage used “${normalizedWord}” in a way that made its meaning clear from context.`,
        targetSense: null,
      },
    ];
  }

  const confusedRaw = Array.isArray(nested.confusedWith)
    ? nested.confusedWith
    : [];
  const confusedWith = confusedRaw
    .map((item) => {
      if (typeof item === "string") {
        const w = item.trim();
        return w ? { word: w, distinction: null as string | null } : null;
      }
      const rec = asRecord(item);
      const w = asString(rec?.word);
      if (!w) return null;
      return {
        word: w,
        distinction: asString(rec?.distinction) || null,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 8);

  const summary =
    clip(asString(etymologyRec.summary), 800) ||
    "This word is not especially useful to decompose into modern GRE-style roots without further dictionary verification.";

  return {
    word: asString(nested.word) || word,
    normalizedWord: asString(nested.normalizedWord) || normalizedWord,
    partOfSpeech: partOfSpeech.length ? partOfSpeech.slice(0, 6) : ["adjective"],
    pronunciation: {
      ipa: asString(pronunciation.ipa) || null,
      simple: asString(pronunciation.simple) || null,
      confidence: confOpt(pronunciation.confidence),
    },
    definitions: definitions.slice(0, 6),
    etymology: {
      summary,
      isUsefulForRootLearning: Boolean(
        etymologyRec.isUsefulForRootLearning ?? components.length > 0,
      ),
      uncertaintyNote: asString(etymologyRec.uncertaintyNote) || null,
      components,
    },
    memoryHook: {
      text: clip(memoryText, 400),
      type: memoryType,
    },
    synonyms,
    antonyms: asStringArray(nested.antonyms).slice(0, 12),
    exampleSentences,
    wordFamily: asStringArray(nested.wordFamily).slice(0, 12),
    usageNotes: asString(nested.usageNotes) || null,
    confusedWith,
  };
}

export function formatValidationIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): string {
  return issues
    .slice(0, 8)
    .map((issue) => {
      const path = issue.path.map(String).join(".") || "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}
