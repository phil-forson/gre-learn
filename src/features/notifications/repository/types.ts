import type {
  NotificationPreferences,
  PushDeviceToken,
} from "@/features/notifications/types";
import type { PatchNotificationPreferencesInput } from "@/features/notifications/schemas/preferences";

export interface NotificationRepository {
  getOrCreatePreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(
    userId: string,
    patch: PatchNotificationPreferencesInput & {
      lastDigestSentOn?: string | null;
      pianoTipsSentOn?: string | null;
      pianoTipsSentCount?: number;
      lastPianoTipSentAt?: string | null;
    },
  ): Promise<NotificationPreferences>;
  listEnabledPreferences(): Promise<NotificationPreferences[]>;
  upsertPushToken(
    userId: string,
    token: string,
    userAgent?: string | null,
  ): Promise<PushDeviceToken>;
  deletePushToken(userId: string, token: string): Promise<void>;
  deleteAllPushTokens(userId: string): Promise<void>;
  listPushTokens(userId: string): Promise<PushDeviceToken[]>;
}
