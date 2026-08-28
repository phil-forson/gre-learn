import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import { resetEnvCacheForTests } from "@/lib/env";
import { assertNotificationsMutationAuth } from "@/features/notifications/services/mutation-auth";

const ORIGINAL_PAIRING = process.env.NOTIFICATIONS_PAIRING_SECRET;
const ORIGINAL_CRON = process.env.CRON_SECRET;

function requestWith(headers: Record<string, string>) {
  return new Request("http://localhost/api/notifications/test", {
    method: "POST",
    headers,
  });
}

beforeEach(() => {
  resetEnvCacheForTests();
});

afterEach(() => {
  if (ORIGINAL_PAIRING === undefined) {
    delete process.env.NOTIFICATIONS_PAIRING_SECRET;
  } else {
    process.env.NOTIFICATIONS_PAIRING_SECRET = ORIGINAL_PAIRING;
  }
  if (ORIGINAL_CRON === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = ORIGINAL_CRON;
  }
  resetEnvCacheForTests();
});

describe("assertNotificationsMutationAuth", () => {
  it("returns 503 when no secrets are configured", () => {
    delete process.env.NOTIFICATIONS_PAIRING_SECRET;
    delete process.env.CRON_SECRET;
    resetEnvCacheForTests();
    expect(() =>
      assertNotificationsMutationAuth(requestWith({})),
    ).toThrowError(AppError);
    try {
      assertNotificationsMutationAuth(requestWith({}));
    } catch (error) {
      expect((error as AppError).status).toBe(503);
      expect((error as AppError).code).toBe("NOTIFICATIONS_AUTH_NOT_CONFIGURED");
    }
  });

  it("accepts matching X-Notifications-Pairing", () => {
    process.env.NOTIFICATIONS_PAIRING_SECRET = "pair-ok";
    delete process.env.CRON_SECRET;
    resetEnvCacheForTests();
    expect(() =>
      assertNotificationsMutationAuth(
        requestWith({ "x-notifications-pairing": "pair-ok" }),
      ),
    ).not.toThrow();
  });

  it("rejects wrong pairing", () => {
    process.env.NOTIFICATIONS_PAIRING_SECRET = "pair-ok";
    delete process.env.CRON_SECRET;
    resetEnvCacheForTests();
    try {
      assertNotificationsMutationAuth(
        requestWith({ "x-notifications-pairing": "nope" }),
      );
      expect.unreachable();
    } catch (error) {
      expect((error as AppError).status).toBe(401);
    }
  });

  it("accepts CRON_SECRET via X-Notifications-Pairing for Settings UX", () => {
    delete process.env.NOTIFICATIONS_PAIRING_SECRET;
    process.env.CRON_SECRET = "cron-as-pairing";
    resetEnvCacheForTests();
    expect(() =>
      assertNotificationsMutationAuth(
        requestWith({ "x-notifications-pairing": "cron-as-pairing" }),
      ),
    ).not.toThrow();
  });
});
