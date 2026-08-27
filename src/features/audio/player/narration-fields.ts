import type { PlayerSegment } from "@/features/learning/types";

export const NARRATION_FIELDS_KEY = "gre-learn-narration-fields";

export const NARRATION_FIELD_KEYS = [
  "word",
  "spelling",
  "pronunciation",
  "meaning",
  "commonLink",
  "synonyms",
  "breakdown",
  "memoryTrick",
  "sentence",
] as const;

export type NarrationFieldKey = (typeof NARRATION_FIELD_KEYS)[number];

export type NarrationFieldsPrefs = Record<NarrationFieldKey, boolean>;

export const NARRATION_FIELD_LABELS: Record<NarrationFieldKey, string> = {
  word: "Word",
  spelling: "Spelling",
  pronunciation: "Pronunciation",
  meaning: "Meaning",
  commonLink: "Common Link",
  synonyms: "Synonyms",
  breakdown: "Breakdown",
  memoryTrick: "Memory Trick",
  sentence: "Sentence",
};

export function defaultNarrationFields(): NarrationFieldsPrefs {
  return {
    word: true,
    spelling: true,
    pronunciation: true,
    meaning: true,
    commonLink: true,
    synonyms: true,
    breakdown: true,
    memoryTrick: true,
    sentence: true,
  };
}

/** Merge stored JSON with defaults; unknown keys ignored; invalid values ignored. */
export function parseNarrationFields(raw: unknown): NarrationFieldsPrefs {
  const defaults = defaultNarrationFields();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaults;
  }
  const record = raw as Record<string, unknown>;
  const next = { ...defaults };
  for (const key of NARRATION_FIELD_KEYS) {
    if (typeof record[key] === "boolean") {
      next[key] = record[key];
    }
  }
  // Ensure at least one remains true after parse.
  if (!NARRATION_FIELD_KEYS.some((key) => next[key])) {
    return defaults;
  }
  return next;
}

export function loadNarrationFields(): NarrationFieldsPrefs {
  if (typeof localStorage === "undefined") {
    return defaultNarrationFields();
  }
  try {
    const raw = localStorage.getItem(NARRATION_FIELDS_KEY);
    if (!raw) return defaultNarrationFields();
    return parseNarrationFields(JSON.parse(raw) as unknown);
  } catch {
    return defaultNarrationFields();
  }
}

export function saveNarrationFields(prefs: NarrationFieldsPrefs): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(NARRATION_FIELDS_KEY, JSON.stringify(prefs));
}

/**
 * Toggle a checklist field. Refuses to turn off the last remaining checked field.
 */
export function setNarrationField(
  prefs: NarrationFieldsPrefs,
  key: NarrationFieldKey,
  enabled: boolean,
): NarrationFieldsPrefs {
  if (!enabled) {
    const othersOn = NARRATION_FIELD_KEYS.some((k) => k !== key && prefs[k]);
    if (!othersOn) return prefs;
  }
  if (prefs[key] === enabled) return prefs;
  return { ...prefs, [key]: enabled };
}

function matchesNarrationField(
  segment: Pick<PlayerSegment, "type" | "text">,
  key: NarrationFieldKey,
): boolean {
  switch (key) {
    case "word":
      return segment.type === "word";
    case "spelling":
      return segment.type === "spelling";
    case "pronunciation":
      return segment.type === "pronunciation";
    case "meaning":
      return segment.type === "definition";
    case "commonLink":
      return (
        segment.type === "synonyms" && segment.text.startsWith("Common link:")
      );
    case "synonyms":
      return (
        segment.type === "synonyms" && segment.text.startsWith("Synonyms")
      );
    case "breakdown":
      return segment.type === "etymology";
    case "memoryTrick":
      return segment.type === "memory_hook";
    case "sentence":
      return segment.type === "example";
  }
}

/** Play-time filter only — does not mutate generation / TTS cache. */
export function filterSegmentsForNarration(
  segments: readonly PlayerSegment[],
  prefs: NarrationFieldsPrefs,
): PlayerSegment[] {
  return segments.filter((segment) =>
    NARRATION_FIELD_KEYS.some(
      (key) => prefs[key] && matchesNarrationField(segment, key),
    ),
  );
}
