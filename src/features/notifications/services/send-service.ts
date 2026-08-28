import { getMessaging } from "firebase-admin/messaging";
import { getEnv, getProviderStatus } from "@/lib/env";
import { getFirebaseAdminApp } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import { getNotificationRepository } from "@/features/notifications/repository";
import { buildDigestForUser } from "@/features/notifications/services/digest-service";
import { localHour } from "@/features/notifications/services/digest-builder";
import type {
  DigestPayload,
  NotificationPreferences,
} from "@/features/notifications/types";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export function isFcmSendConfigured(): boolean {
  const env = getEnv();
  const status = getProviderStatus();
  return (
    status.firebaseConfigured &&
    Boolean(env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) &&
    Boolean(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
    Boolean(env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
    Boolean(env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) &&
    Boolean(env.NEXT_PUBLIC_FIREBASE_APP_ID)
  );
}

export function isFcmClientConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      env.NEXT_PUBLIC_FIREBASE_APP_ID &&
      env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  );
}

async function sendPayloadToTokens(
  tokens: string[],
  payload: DigestPayload,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  if (tokens.length === 0) {
    return { sent: 0, failed: 0, errors: [] };
  }

  if (!getProviderStatus().firebaseConfigured) {
    return {
      sent: 0,
      failed: tokens.length,
      errors: ["Firebase Admin is not configured"],
    };
  }

  const messaging = getMessaging(getFirebaseAdminApp());
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const token of tokens) {
    try {
      await messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          url: payload.url,
          kind: payload.kind,
          localDay: payload.localDay,
        },
        webpush: {
          fcmOptions: {
            link: payload.url,
          },
        },
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      errors.push(
        error instanceof Error ? error.message : "Unknown FCM send error",
      );
    }
  }

  return { sent, failed, errors };
}

export async function sendTestDigest(): Promise<{
  ok: boolean;
  configured: boolean;
  payload: DigestPayload | null;
  result: { sent: number; failed: number; errors: string[] };
  message: string;
}> {
  const configured = isFcmSendConfigured();
  const repo = getNotificationRepository();
  const prefs = await repo.getOrCreatePreferences(getUserId());
  if (!prefs.enabled) {
    throw new AppError(
      "Enable Today’s English digests first.",
      "NOTIFICATIONS_DISABLED",
      400,
    );
  }

  const tokens = await repo.listPushTokens(getUserId());
  const payload = await buildDigestForUser(prefs, new Date(), { force: true });
  if (!payload) {
    return {
      ok: false,
      configured,
      payload: null,
      result: { sent: 0, failed: 0, errors: [] },
      message:
        "Could not build a test digest. Check timezone and continue target.",
    };
  }

  if (!configured) {
    return {
      ok: true,
      configured: false,
      payload,
      result: { sent: 0, failed: 0, errors: [] },
      message:
        "Digest built, but FCM/VAPID is not configured. Set Firebase client keys + NEXT_PUBLIC_FIREBASE_VAPID_KEY and Firebase Admin credentials.",
    };
  }

  if (tokens.length === 0) {
    return {
      ok: false,
      configured,
      payload,
      result: { sent: 0, failed: 0, errors: [] },
      message:
        "No push tokens registered for this device yet. Tap Enable digests again to register this phone.",
    };
  }

  const result = await sendPayloadToTokens(
    tokens.map((t) => t.token),
    payload,
  );
  const errorDetail =
    result.errors.length > 0 ? ` ${result.errors[0]}` : "";
  return {
    ok: result.sent > 0,
    configured,
    payload,
    result,
    message:
      result.sent > 0
        ? `Sent test digest to ${result.sent} device(s).`
        : tokens.length === 0
          ? "No push tokens registered for this device yet. Tap Enable digests again to register this phone."
          : `Failed to send test digest.${errorDetail}`,
  };
}

function shouldSendAtHour(
  prefs: NotificationPreferences,
  now: Date,
): boolean {
  const hour = localHour(now, prefs.timezone || "UTC");
  return hour === prefs.sendHourLocal;
}

export type DigestCronResult = {
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  details: Array<{
    userId: string;
    status: "sent" | "skipped" | "failed" | "no_tokens" | "not_hour";
    reason?: string;
  }>;
};

export async function runDailyDigestCron(
  now: Date = new Date(),
  options?: { ignoreSendHour?: boolean },
): Promise<DigestCronResult> {
  const repo = getNotificationRepository();
  const enabled = await repo.listEnabledPreferences();
  const details: DigestCronResult["details"] = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const prefs of enabled) {
    if (!options?.ignoreSendHour && !shouldSendAtHour(prefs, now)) {
      skipped += 1;
      details.push({
        userId: prefs.userId,
        status: "not_hour",
        reason: `local hour ≠ ${prefs.sendHourLocal}`,
      });
      continue;
    }

    const payload = await buildDigestForUser(prefs, now);
    if (!payload) {
      skipped += 1;
      details.push({
        userId: prefs.userId,
        status: "skipped",
        reason: "no payload (idempotent, quiet, or skip empty)",
      });
      continue;
    }

    const tokens = await repo.listPushTokens(prefs.userId);
    if (tokens.length === 0) {
      skipped += 1;
      details.push({
        userId: prefs.userId,
        status: "no_tokens",
      });
      continue;
    }

    if (!getProviderStatus().firebaseConfigured) {
      skipped += 1;
      details.push({
        userId: prefs.userId,
        status: "skipped",
        reason: "Firebase Admin not configured",
      });
      continue;
    }

    // Re-check + claim local day before send so overlapping ticks rarely double-send.
    const latest = await repo.getOrCreatePreferences(prefs.userId);
    if (latest.lastDigestSentOn === payload.localDay) {
      skipped += 1;
      details.push({
        userId: prefs.userId,
        status: "skipped",
        reason: "already claimed for local day",
      });
      continue;
    }

    await repo.updatePreferences(prefs.userId, {
      lastDigestSentOn: payload.localDay,
    });

    const result = await sendPayloadToTokens(
      tokens.map((t) => t.token),
      payload,
    );

    if (result.sent > 0) {
      sent += 1;
      details.push({ userId: prefs.userId, status: "sent" });
    } else {
      failed += 1;
      details.push({
        userId: prefs.userId,
        status: "failed",
        reason: result.errors[0] ?? "send failed",
      });
    }
  }

  return {
    processed: enabled.length,
    sent,
    skipped,
    failed,
    details,
  };
}
