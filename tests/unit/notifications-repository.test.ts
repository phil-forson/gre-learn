import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  notificationPreferencesSchema,
  patchNotificationPreferencesSchema,
  pushDeviceTokenSchema,
} from "@/features/notifications/schemas/preferences";
import {
  createLocalNotificationRepository,
  setNotificationRepositoryForTests,
} from "@/features/notifications/repository";
import { defaultNotificationPreferences } from "@/features/notifications/defaults";

describe("notification schemas", () => {
  it("accepts default preferences shape", () => {
    const prefs = defaultNotificationPreferences("default-user");
    const parsed = notificationPreferencesSchema.safeParse(prefs);
    expect(parsed.success).toBe(true);
    expect(prefs.enabled).toBe(false);
    expect(prefs.sendHourLocal).toBe(20);
    expect(prefs.skipEmptyDays).toBe(false);
  });

  it("rejects client patch of unknown keys", () => {
    const bad = patchNotificationPreferencesSchema.safeParse({
      enabled: true,
      lastDigestSentOn: "2026-08-28",
    });
    expect(bad.success).toBe(false);
  });

  it("validates push tokens", () => {
    const ok = pushDeviceTokenSchema.safeParse({
      id: "t1",
      userId: "u1",
      token: "abcdefghij1234567890",
      platform: "web",
      userAgent: null,
      dateCreated: "2026-01-01T00:00:00.000Z",
      dateUpdated: "2026-01-01T00:00:00.000Z",
    });
    expect(ok.success).toBe(true);
  });
});

describe("local notification repository", () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = mkdtempSync(path.join(tmpdir(), "gre-notif-"));
    setNotificationRepositoryForTests(
      createLocalNotificationRepository({ dataDir }),
    );
  });

  afterEach(() => {
    setNotificationRepositoryForTests(null);
  });

  it("creates opt-in-off defaults and upserts tokens in temp dir only", async () => {
    const repo = createLocalNotificationRepository({ dataDir });
    const prefs = await repo.getOrCreatePreferences("default-user");
    expect(prefs.enabled).toBe(false);
    expect(prefs.sendHourLocal).toBe(20);

    const enabled = await repo.updatePreferences("default-user", {
      enabled: true,
      timezone: "America/Chicago",
    });
    expect(enabled.enabled).toBe(true);
    expect(enabled.timezone).toBe("America/Chicago");

    const token = await repo.upsertPushToken(
      "default-user",
      "token-abcdefghijklmnopqrstuvwxyz",
      "vitest",
    );
    expect(token.platform).toBe("web");
    const listed = await repo.listPushTokens("default-user");
    expect(listed).toHaveLength(1);

    await repo.deleteAllPushTokens("default-user");
    expect(await repo.listPushTokens("default-user")).toHaveLength(0);

    expect(dataDir.startsWith(tmpdir())).toBe(true);
  });

  it("listEnabledPreferences only returns enabled rows", async () => {
    const repo = createLocalNotificationRepository({ dataDir });
    await repo.getOrCreatePreferences("u-off");
    await repo.updatePreferences("u-on", { enabled: true });
    const enabled = await repo.listEnabledPreferences();
    expect(enabled.every((p) => p.enabled)).toBe(true);
    expect(enabled.some((p) => p.userId === "u-on")).toBe(true);
    expect(enabled.some((p) => p.userId === "u-off")).toBe(false);
  });
});
