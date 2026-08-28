import { getEnv } from "@/lib/env";
import {
  getNotificationRepository,
} from "@/features/notifications/repository";
import {
  patchNotificationPreferencesSchema,
  upsertPushTokenSchema,
} from "@/features/notifications/schemas/preferences";
import type { NotificationPreferences } from "@/features/notifications/types";
import { AppError } from "@/lib/errors";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return getNotificationRepository().getOrCreatePreferences(getUserId());
}

export async function patchNotificationPreferences(
  body: unknown,
): Promise<NotificationPreferences> {
  const parsed = patchNotificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(
      "Invalid notification preferences patch",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const repo = getNotificationRepository();
  const next = await repo.updatePreferences(getUserId(), parsed.data);

  if (parsed.data.enabled === false) {
    await repo.deleteAllPushTokens(getUserId());
  }

  return next;
}

export async function registerPushToken(body: unknown) {
  const parsed = upsertPushTokenSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(
      "Invalid push token",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  const prefs = await getNotificationRepository().getOrCreatePreferences(
    getUserId(),
  );
  if (!prefs.enabled) {
    throw new AppError(
      "Enable Today’s English digests before registering a device.",
      "NOTIFICATIONS_DISABLED",
      400,
    );
  }
  return getNotificationRepository().upsertPushToken(
    getUserId(),
    parsed.data.token,
    parsed.data.userAgent ?? null,
  );
}

export async function unregisterPushToken(body: unknown) {
  const parsed = upsertPushTokenSchema
    .pick({ token: true })
    .safeParse(body);
  if (!parsed.success) {
    throw new AppError(
      "Invalid push token",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  await getNotificationRepository().deletePushToken(
    getUserId(),
    parsed.data.token,
  );
  return { ok: true as const };
}
