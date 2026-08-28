import { describe, expect, it } from "vitest";
import {
  formatLearningSource,
  isLearningSource,
} from "@/lib/learning-source";

describe("learning-source", () => {
  it("accepts valid https sources", () => {
    const source = {
      title: "pianoscales.org",
      url: "https://pianoscales.org/major.html",
      note: "fingerings",
    };
    expect(isLearningSource(source)).toBe(true);
    expect(formatLearningSource(source)).toContain("https://");
  });

  it("rejects missing or invalid urls", () => {
    expect(isLearningSource({ title: "x", url: "not-a-url" })).toBe(false);
    expect(isLearningSource({ title: "x" })).toBe(false);
    expect(isLearningSource(null)).toBe(false);
  });
});
