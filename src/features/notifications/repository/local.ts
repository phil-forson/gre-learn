import {
  defaultNotificationPreferences,
  normalizeNotificationPreferences,
} from "@/features/notifications/defaults";
import {
  notificationPreferencesSchema,
  pushDeviceTokenSchema,
  type PatchNotificationPreferencesInput,
} from "@/features/notifications/schemas/preferences";
import type {
  NotificationPreferences,
  PushDeviceToken,
} from "@/features/notifications/types";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import type { NotificationRepository } from "./types";

function assertValidPrefs(
  prefs: NotificationPreferences,
): NotificationPreferences {
  const parsed = notificationPreferencesSchema.safeParse(prefs);
  if (!parsed.success) {
    throw new AppError(
      "Invalid notification preferences",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidToken(token: PushDeviceToken): PushDeviceToken {
  const parsed = pushDeviceTokenSchema.safeParse(token);
  if (!parsed.success) {
    throw new AppError(
      "Invalid push device token",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

export type LocalNotificationRepositoryOptions = {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
};

export class LocalNotificationRepository implements NotificationRepository {
  private readonly vocabRepo: LocalVocabularyRepository;

  constructor(options?: LocalNotificationRepositoryOptions) {
    this.vocabRepo =
      options?.vocabRepo ??
      new LocalVocabularyRepository({ dataDir: options?.dataDir });
  }

  async getOrCreatePreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    const existing = await this.vocabRepo.getNotificationPreferences(userId);
    if (existing) {
      const normalized = normalizeNotificationPreferences({
        ...existing,
        id: existing.id,
        userId: existing.userId,
      });
      const parsed = notificationPreferencesSchema.safeParse(normalized);
      if (parsed.success) return parsed.data;
      const fresh = {
        ...defaultNotificationPreferences(userId),
        id: existing.id,
      };
      return this.vocabRepo.upsertNotificationPreferences(
        assertValidPrefs(fresh),
      );
    }
    return this.vocabRepo.upsertNotificationPreferences(
      assertValidPrefs(defaultNotificationPreferences(userId)),
    );
  }

  async updatePreferences(
    userId: string,
    patch: PatchNotificationPreferencesInput & {
      lastDigestSentOn?: string | null;
      pianoTipsSentOn?: string | null;
      pianoTipsSentCount?: number;
      lastPianoTipSentAt?: string | null;
    },
  ): Promise<NotificationPreferences> {
    const current = await this.getOrCreatePreferences(userId);
    const next: NotificationPreferences = {
      ...current,
      ...patch,
      id: current.id,
      userId: current.userId,
      dateUpdated: nowIso(),
    };
    return this.vocabRepo.upsertNotificationPreferences(assertValidPrefs(next));
  }

  async listEnabledPreferences(): Promise<NotificationPreferences[]> {
    const all = await this.vocabRepo.listNotificationPreferences();
    return all.filter((p) => {
      const parsed = notificationPreferencesSchema.safeParse(p);
      return parsed.success && parsed.data.enabled;
    });
  }

  async upsertPushToken(
    userId: string,
    token: string,
    userAgent?: string | null,
  ): Promise<PushDeviceToken> {
    const now = nowIso();
    const row: PushDeviceToken = {
      id: createId("pushtoken"),
      userId,
      token,
      platform: "web",
      userAgent: userAgent ?? null,
      dateCreated: now,
      dateUpdated: now,
    };
    return this.vocabRepo.upsertPushDeviceToken(assertValidToken(row));
  }

  async deletePushToken(userId: string, token: string): Promise<void> {
    await this.vocabRepo.deletePushDeviceToken(userId, token);
  }

  async deleteAllPushTokens(userId: string): Promise<void> {
    await this.vocabRepo.deleteAllPushDeviceTokens(userId);
  }

  async listPushTokens(userId: string): Promise<PushDeviceToken[]> {
    const tokens = await this.vocabRepo.listPushDeviceTokens(userId);
    return tokens.filter((t) => pushDeviceTokenSchema.safeParse(t).success);
  }
}
