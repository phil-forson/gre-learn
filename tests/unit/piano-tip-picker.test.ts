import { describe, expect, it } from "vitest";
import { defaultNotificationPreferences } from "@/features/notifications/defaults";
import { PIANO_TIP_CATALOG } from "@/features/notifications/data/piano-tip-catalog";
import {
  PIANO_TIP_MAX_PER_DAY,
  buildPianoTipPayload,
  isWithinPianoTipWindow,
  pickPianoTip,
  shouldSendPianoTipNow,
} from "@/features/notifications/services/piano-tip-picker";

function prefs(overrides: Record<string, unknown> = {}) {
  return {
    ...defaultNotificationPreferences("user-a"),
    enabled: true,
    timezone: "UTC",
    ...overrides,
  };
}

describe("piano-tip-picker", () => {
  it("catalog has unique ids and sourced entries", () => {
    const ids = PIANO_TIP_CATALOG.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of PIANO_TIP_CATALOG) {
      expect(entry.source.url).toMatch(/^https:\/\//);
      expect(entry.href.startsWith("/")).toBe(true);
    }
  });

  it("pickPianoTip is stable for user/day/hour", () => {
    const a = pickPianoTip("user-a", "2026-08-28", 14);
    const b = pickPianoTip("user-a", "2026-08-28", 14);
    const c = pickPianoTip("user-a", "2026-08-28", 15);
    expect(a.id).toBe(b.id);
    expect(a.id).not.toBe(c.id);
  });

  it("buildPianoTipPayload truncates long bodies", () => {
    const entry = PIANO_TIP_CATALOG[0]!;
    const payload = buildPianoTipPayload(entry, "2026-08-28");
    expect(payload.title).toBe("Piano tip");
    expect(payload.kind).toBe("piano-tip");
    expect(payload.body.length).toBeLessThanOrEqual(155);
    expect(payload.tipId).toBe(entry.id);
  });

  it("respects active window and quiet hours", () => {
    const morning = new Date("2026-08-28T08:30:00.000Z");
    const midday = new Date("2026-08-28T14:00:00.000Z");
    expect(isWithinPianoTipWindow(8)).toBe(false);
    expect(isWithinPianoTipWindow(9)).toBe(true);
    expect(isWithinPianoTipWindow(20)).toBe(true);
    expect(isWithinPianoTipWindow(21)).toBe(false);

    expect(
      shouldSendPianoTipNow(prefs(), morning),
    ).toBe(false);

    const quiet = prefs({
      quietHoursStart: 13,
      quietHoursEnd: 15,
    });
    expect(shouldSendPianoTipNow(quiet, midday)).toBe(false);
  });

  it("respects daily cap and minimum gap", () => {
    const midday = new Date("2026-08-28T14:00:00.000Z");
    const capped = prefs({
      pianoTipsSentOn: "2026-08-28",
      pianoTipsSentCount: PIANO_TIP_MAX_PER_DAY,
    });
    expect(shouldSendPianoTipNow(capped, midday)).toBe(false);

    const recent = prefs({
      lastPianoTipSentAt: new Date("2026-08-28T13:30:00.000Z").toISOString(),
    });
    expect(shouldSendPianoTipNow(recent, midday)).toBe(false);
  });

  it("honors includePianoTips off", () => {
    const midday = new Date("2026-08-28T14:00:00.000Z");
    expect(
      shouldSendPianoTipNow(
        prefs({ includePianoTips: false }),
        midday,
      ),
    ).toBe(false);
    expect(
      shouldSendPianoTipNow(
        prefs({ includePiano: false }),
        midday,
      ),
    ).toBe(false);
  });

  it("allows some hourly rolls to pass the random gate", () => {
    let passes = 0;
    for (const userId of ["user-a", "user-b", "user-c", "user-d"]) {
      for (let hour = 9; hour < 21; hour++) {
        const at = new Date(
          `2026-08-28T${String(hour).padStart(2, "0")}:00:00.000Z`,
        );
        if (shouldSendPianoTipNow(prefs({ userId }), at)) {
          passes += 1;
        }
      }
    }
    expect(passes).toBeGreaterThan(0);
  });
});
