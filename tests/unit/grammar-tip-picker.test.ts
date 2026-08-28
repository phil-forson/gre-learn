import { describe, expect, it } from "vitest";
import { listGrammarUnits } from "@/features/grammar/catalog";
import {
  grammarTipForDigest,
  pickGrammarTip,
  shouldIncludeGrammarTip,
} from "@/features/notifications/services/grammar-tip-picker";

describe("grammar tip picker", () => {
  it("picks a stable unit for a user/day", async () => {
    const units = await listGrammarUnits();
    const a = pickGrammarTip(units, "user-a", "2026-08-28");
    const b = pickGrammarTip(units, "user-a", "2026-08-28");
    const c = pickGrammarTip(units, "user-b", "2026-08-28");
    expect(a).not.toBeNull();
    expect(b?.unitId).toBe(a?.unitId);
    expect(c?.unitId).not.toBe(a?.unitId);
    expect(a?.ruleLine).toBeTruthy();
    expect(a?.slug).toBeTruthy();
  });

  it("includes tips on roughly half of days for a fixed user", () => {
    let tips = 0;
    for (let day = 1; day <= 30; day++) {
      const localDay = `2026-08-${String(day).padStart(2, "0")}`;
      if (shouldIncludeGrammarTip("default-user", localDay)) tips += 1;
    }
    expect(tips).toBeGreaterThan(5);
    expect(tips).toBeLessThan(25);
  });

  it("returns null when chance is zero", async () => {
    const units = await listGrammarUnits();
    expect(
      grammarTipForDigest(units, "default-user", "2026-08-28", 0),
    ).toBeNull();
  });
});
