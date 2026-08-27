import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  defaultNarrationFields,
  filterSegmentsForNarration,
  loadNarrationFields,
  NARRATION_FIELDS_KEY,
  parseNarrationFields,
  saveNarrationFields,
  setNarrationField,
  type NarrationFieldsPrefs,
} from "@/features/audio/player/narration-fields";
import type { PlayerSegment } from "@/features/learning/types";

function seg(
  partial: Pick<PlayerSegment, "type" | "text"> & { id?: string; order?: number },
): PlayerSegment {
  return {
    id: partial.id ?? `${partial.type}-${partial.order ?? 0}`,
    type: partial.type,
    text: partial.text,
    order: partial.order ?? 0,
    audioUrl: null,
  };
}

const sampleSegments: PlayerSegment[] = [
  seg({ type: "word", text: "Austere.", order: 0 }),
  seg({ type: "spelling", text: "A. U. S. T. E. R. E.", order: 1 }),
  seg({ type: "pronunciation", text: "Pronounced: aw-STEER.", order: 2 }),
  seg({ type: "definition", text: "Austere means severe or strict.", order: 3 }),
  seg({ type: "synonyms", text: "Common link: stern.", order: 4 }),
  seg({ type: "etymology", text: "Root and origin: Greek.", order: 5 }),
  seg({ type: "memory_hook", text: "Memory hook: a stern teacher.", order: 6 }),
  seg({ type: "synonyms", text: "Synonyms include stern, and severe.", order: 7 }),
  seg({ type: "example", text: "Example: an austere diet.", order: 8 }),
];

describe("parseNarrationFields", () => {
  it("defaults all true", () => {
    expect(defaultNarrationFields()).toEqual({
      word: true,
      spelling: true,
      pronunciation: true,
      meaning: true,
      commonLink: true,
      synonyms: true,
      breakdown: true,
      memoryTrick: true,
      sentence: true,
    });
  });

  it("merges partial stored prefs and ignores unknown keys", () => {
    const parsed = parseNarrationFields({
      word: false,
      meaning: false,
      unknown: true,
      spelling: "nope",
    });
    expect(parsed.word).toBe(false);
    expect(parsed.meaning).toBe(false);
    expect(parsed.spelling).toBe(true);
    expect(parsed.sentence).toBe(true);
  });

  it("falls back to defaults when all fields would be false", () => {
    const allOff = Object.fromEntries(
      Object.keys(defaultNarrationFields()).map((k) => [k, false]),
    );
    expect(parseNarrationFields(allOff)).toEqual(defaultNarrationFields());
  });
});

describe("setNarrationField", () => {
  it("refuses to turn off the last checked field", () => {
    const onlyWord: NarrationFieldsPrefs = {
      ...defaultNarrationFields(),
      spelling: false,
      pronunciation: false,
      meaning: false,
      commonLink: false,
      synonyms: false,
      breakdown: false,
      memoryTrick: false,
      sentence: false,
    };
    expect(setNarrationField(onlyWord, "word", false)).toBe(onlyWord);
  });

  it("allows toggling when another field remains on", () => {
    const next = setNarrationField(defaultNarrationFields(), "spelling", false);
    expect(next.spelling).toBe(false);
    expect(next.word).toBe(true);
  });
});

describe("filterSegmentsForNarration", () => {
  it("keeps all segments when prefs are all true", () => {
    expect(
      filterSegmentsForNarration(sampleSegments, defaultNarrationFields()),
    ).toHaveLength(sampleSegments.length);
  });

  it("filters by checklist predicates including synonym split", () => {
    const prefs: NarrationFieldsPrefs = {
      ...defaultNarrationFields(),
      word: false,
      spelling: false,
      pronunciation: false,
      meaning: false,
      commonLink: true,
      synonyms: true,
      breakdown: false,
      memoryTrick: false,
      sentence: false,
    };
    const filtered = filterSegmentsForNarration(sampleSegments, prefs);
    expect(filtered.map((s) => s.text)).toEqual([
      "Common link: stern.",
      "Synonyms include stern, and severe.",
    ]);
  });

  it("can keep only Common Link among synonym-type segments", () => {
    const prefs = setNarrationField(
      {
        ...defaultNarrationFields(),
        word: false,
        spelling: false,
        pronunciation: false,
        meaning: false,
        synonyms: false,
        breakdown: false,
        memoryTrick: false,
        sentence: false,
      },
      "commonLink",
      true,
    );
    const filtered = filterSegmentsForNarration(sampleSegments, prefs);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.text).toBe("Common link: stern.");
  });

  it("maps meaning/breakdown/memoryTrick/sentence to script types", () => {
    const prefs: NarrationFieldsPrefs = {
      word: false,
      spelling: false,
      pronunciation: false,
      meaning: true,
      commonLink: false,
      synonyms: false,
      breakdown: true,
      memoryTrick: true,
      sentence: true,
    };
    expect(
      filterSegmentsForNarration(sampleSegments, prefs).map((s) => s.type),
    ).toEqual(["definition", "etymology", "memory_hook", "example"]);
  });

  it("returns empty when enabled fields have no matching segments", () => {
    const prefs: NarrationFieldsPrefs = {
      ...defaultNarrationFields(),
      word: false,
      spelling: false,
      pronunciation: false,
      meaning: false,
      commonLink: true,
      synonyms: false,
      breakdown: false,
      memoryTrick: false,
      sentence: false,
    };
    const withoutLink = sampleSegments.filter(
      (s) => !(s.type === "synonyms" && s.text.startsWith("Common link:")),
    );
    expect(filterSegmentsForNarration(withoutLink, prefs)).toEqual([]);
  });
});

describe("load/saveNarrationFields", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists and reloads prefs", () => {
    const prefs = setNarrationField(defaultNarrationFields(), "spelling", false);
    saveNarrationFields(prefs);
    expect(store.get(NARRATION_FIELDS_KEY)).toBeTruthy();
    expect(loadNarrationFields()).toEqual(prefs);
  });

  it("returns defaults for corrupt JSON", () => {
    store.set(NARRATION_FIELDS_KEY, "{not-json");
    expect(loadNarrationFields()).toEqual(defaultNarrationFields());
  });
});
