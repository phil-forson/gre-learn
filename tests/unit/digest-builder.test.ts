import { describe, expect, it } from "vitest";
import { defaultNotificationPreferences } from "@/features/notifications/defaults";
import {
  buildDailyDigest,
  isInQuietHours,
  isSafeAppPath,
  localDayKey,
} from "@/features/notifications/services/digest-builder";
import type { DigestBuildInput } from "@/features/notifications/types";

function baseInput(
  overrides: Partial<DigestBuildInput> = {},
): DigestBuildInput {
  const prefs = {
    ...defaultNotificationPreferences("default-user"),
    enabled: true,
    timezone: "America/Chicago",
  };
  return {
    prefs,
    now: new Date("2026-08-28T02:00:00.000Z"), // 21:00 previous evening CDT? Use fixed local-friendly
    grammar: [],
    vocabNew: [],
    vocabReviewed: [],
    continueTarget: {
      href: "/grammar/present-perfect-experience",
      label: "Continue grammar — Present perfect (experience)",
      needsPlacement: false,
    },
    ...overrides,
  };
}

describe("digest builder helpers", () => {
  it("computes local day keys", () => {
    const d = new Date("2026-08-28T05:00:00.000Z");
    expect(localDayKey(d, "UTC")).toBe("2026-08-28");
    expect(isSafeAppPath("/path")).toBe(true);
    expect(isSafeAppPath("https://evil.example")).toBe(false);
    expect(isSafeAppPath("//evil.example")).toBe(false);
  });

  it("handles quiet hours spanning midnight", () => {
    expect(isInQuietHours(23, 22, 7)).toBe(true);
    expect(isInQuietHours(3, 22, 7)).toBe(true);
    expect(isInQuietHours(12, 22, 7)).toBe(false);
    expect(isInQuietHours(10, 9, 11)).toBe(true);
    expect(isInQuietHours(8, null, 11)).toBe(false);
  });
});

describe("buildDailyDigest", () => {
  it("builds mixed grammar + vocab copy", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
        grammar: [
          { unitId: "u1", title: "Present perfect" },
          { unitId: "u2", title: "Future forms" },
        ],
        vocabNew: [
          { word: "laconic", definition: "using few words" },
          { word: "abate", definition: "to lessen" },
        ],
        vocabReviewed: [{ word: "candid", definition: "frank" }],
      }),
    );
    expect(payload).not.toBeNull();
    expect(payload!.title).toBe("Today's English");
    expect(payload!.kind).toBe("active");
    expect(payload!.body).toContain("Grammar:");
    expect(payload!.body).toContain("Vocab:");
    expect(payload!.body).not.toContain("personalNote");
    expect(payload!.grammarCount).toBe(2);
    expect(payload!.vocabNewCount).toBe(2);
    expect(payload!.vocabReviewedCount).toBe(1);
  });

  it("builds grammar-only digest", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
        grammar: [{ unitId: "u1", title: "Conditionals" }],
      }),
    );
    expect(payload!.body.startsWith("Grammar:")).toBe(true);
    expect(payload!.body.includes("Vocab:")).toBe(false);
  });

  it("builds vocab-only digest", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
        vocabNew: [{ word: "ephemeral", definition: "short-lived" }],
      }),
    );
    expect(payload!.body.startsWith("Vocab:")).toBe(true);
    expect(payload!.body.includes("Grammar:")).toBe(false);
  });

  it("empty day uses continue target CTA", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
      }),
    );
    expect(payload!.kind).toBe("continue");
    expect(payload!.body).toContain("Next:");
    expect(payload!.body).toContain("Present perfect");
    expect(payload!.url).toBe("/grammar/present-perfect-experience");
  });

  it("placement-needed empty day deep-links to placement", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
        continueTarget: {
          href: "/path/placement",
          label: "Take placement",
          needsPlacement: true,
        },
      }),
    );
    expect(payload!.kind).toBe("placement");
    expect(payload!.body).toContain("Take placement");
    expect(payload!.url).toBe("/path/placement");
  });

  it("skips during quiet hours", () => {
    const prefs = {
      ...defaultNotificationPreferences("default-user"),
      enabled: true,
      timezone: "UTC",
      quietHoursStart: 20,
      quietHoursEnd: 8,
    };
    const payload = buildDailyDigest(
      baseInput({
        prefs,
        now: new Date("2026-08-28T22:00:00.000Z"),
        grammar: [{ unitId: "u1", title: "Modals" }],
      }),
    );
    expect(payload).toBeNull();
  });

  it("is idempotent for same local day", () => {
    const prefs = {
      ...defaultNotificationPreferences("default-user"),
      enabled: true,
      timezone: "UTC",
      lastDigestSentOn: "2026-08-28",
    };
    const payload = buildDailyDigest(
      baseInput({
        prefs,
        now: new Date("2026-08-28T19:00:00.000Z"),
        grammar: [{ unitId: "u1", title: "Modals" }],
      }),
    );
    expect(payload).toBeNull();
  });

  it("force bypasses idempotency and quiet hours for test sends", () => {
    const prefs = {
      ...defaultNotificationPreferences("default-user"),
      enabled: true,
      timezone: "UTC",
      lastDigestSentOn: "2026-08-28",
      quietHoursStart: 20,
      quietHoursEnd: 8,
    };
    const payload = buildDailyDigest(
      baseInput({
        prefs,
        force: true,
        now: new Date("2026-08-28T22:00:00.000Z"),
        grammar: [{ unitId: "u1", title: "Modals" }],
      }),
    );
    expect(payload).not.toBeNull();
    expect(payload!.body).toContain("Grammar");
  });

  it("honors skipEmptyDays", () => {
    const prefs = {
      ...defaultNotificationPreferences("default-user"),
      enabled: true,
      timezone: "UTC",
      skipEmptyDays: true,
    };
    const payload = buildDailyDigest(
      baseInput({
        prefs,
        now: new Date("2026-08-28T19:00:00.000Z"),
      }),
    );
    expect(payload).toBeNull();
  });

  it("includes piano line and piano-only deep link", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
        piano: [{ label: "Practice today", href: "/piano/today" }],
      }),
    );
    expect(payload).not.toBeNull();
    expect(payload!.body).toContain("Piano:");
    expect(payload!.url).toBe("/piano/today");
    expect(payload!.pianoCount).toBe(1);
  });

  it("appends piano when mixed with grammar", () => {
    const payload = buildDailyDigest(
      baseInput({
        now: new Date("2026-08-28T19:00:00.000Z"),
        grammar: [{ unitId: "u1", title: "Conditionals" }],
        piano: [{ label: "Gospel core", href: "/piano/today" }],
      }),
    );
    expect(payload!.body).toContain("Grammar:");
    expect(payload!.body).toContain("Piano:");
    expect(payload!.url).not.toBe("/piano/today");
  });

  it("treats missing includePiano as enabled; skipEmptyDays counts piano", () => {
    const prefs = {
      ...defaultNotificationPreferences("default-user"),
      enabled: true,
      timezone: "UTC",
      skipEmptyDays: true,
    };
    // Simulate legacy row without the field at runtime
    delete (prefs as { includePiano?: boolean }).includePiano;

    const empty = buildDailyDigest(
      baseInput({
        prefs: prefs as ReturnType<typeof defaultNotificationPreferences>,
        now: new Date("2026-08-28T19:00:00.000Z"),
      }),
    );
    expect(empty).toBeNull();

    const withPiano = buildDailyDigest(
      baseInput({
        prefs: prefs as ReturnType<typeof defaultNotificationPreferences>,
        now: new Date("2026-08-28T19:00:00.000Z"),
        piano: [{ label: "Scales", href: "/piano/today" }],
      }),
    );
    expect(withPiano).not.toBeNull();
    expect(withPiano!.body).toContain("Piano:");
  });
});
