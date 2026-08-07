import { describe, expect, it } from "vitest";
import {
  normalizeBatchInput,
  normalizeWord,
} from "@/features/vocabulary/services/normalize";

describe("normalizeWord", () => {
  it("trims, lowercases, and unifies casing variants", () => {
    const a = normalizeWord("Laconic");
    const b = normalizeWord(" laconic ");
    const c = normalizeWord("LACONIC");
    expect(a.ok && b.ok && c.ok).toBe(true);
    if (a.ok && b.ok && c.ok) {
      expect(a.normalized).toBe("laconic");
      expect(b.normalized).toBe("laconic");
      expect(c.normalized).toBe("laconic");
    }
  });

  it("rejects blank input", () => {
    expect(normalizeWord("   ").ok).toBe(false);
  });

  it("rejects sentence-like input", () => {
    const result = normalizeWord("This is clearly a full sentence about GRE.");
    expect(result.ok).toBe(false);
  });

  it("preserves internal hyphens", () => {
    const result = normalizeWord("self-effacing");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.normalized).toBe("self-effacing");
  });

  it("strips surrounding punctuation", () => {
    const result = normalizeWord('"obdurate,"');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.normalized).toBe("obdurate");
  });
});

describe("normalizeBatchInput", () => {
  it("dedupes within batch after normalization", () => {
    const words = normalizeBatchInput("laconic\nLaconic\n  laconic  \nobdurate");
    expect(words).toHaveLength(2);
  });
});
