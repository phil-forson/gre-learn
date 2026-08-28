import { defaultNotificationPreferences } from "@/features/notifications/defaults";
import {
  notificationPreferencesSchema,
  pushDeviceTokenSchema,
  type PatchNotificationPreferencesInput,
} from "@/features/notifications/schemas/preferences";
import type {
  NotificationPreferences,
  PushDeviceToken,
} from "@/features/notifications/types";
import { getDb } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import type { NotificationRepository } from "./types";

const COL = {
  notificationPreferences: "notificationPreferences",
  pushDeviceTokens: "pushDeviceTokens",
} as const;

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

export class FirebaseNotificationRepository implements NotificationRepository {
  private db = getDb();

  private async findPrefsByUserId(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    const snap = await this.db
      .collection(COL.notificationPreferences)
      .where("userId", "==", userId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0]!;
    const data = doc.data() as NotificationPreferences;
    if (data.userId !== userId) return null;
    return { ...data, id: data.id || doc.id };
  }

  private async writePrefs(
    prefs: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    const valid = assertValidPrefs(prefs);
    await this.db
      .collection(COL.notificationPreferences)
      .doc(valid.id)
      .set(valid);
    return valid;
  }

  async getOrCreatePreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    const existing = await this.findPrefsByUserId(userId);
    if (existing) {
      const withPiano = {
        ...existing,
        includePiano: existing.includePiano !== false,
      };
      const parsed = notificationPreferencesSchema.safeParse(withPiano);
      if (parsed.success) return parsed.data;
      return this.writePrefs({
        ...defaultNotificationPreferences(userId),
        id: existing.id,
      });
    }
    return this.writePrefs(defaultNotificationPreferences(userId));
  }

  async updatePreferences(
    userId: string,
    patch: PatchNotificationPreferencesInput & {
      lastDigestSentOn?: string | null;
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
    return this.writePrefs(next);
  }

  async listEnabledPreferences(): Promise<NotificationPreferences[]> {
    const snap = await this.db
      .collection(COL.notificationPreferences)
      .where("enabled", "==", true)
      .get();
    return snap.docs
      .map((d) => {
        const data = d.data() as NotificationPreferences;
        return { ...data, id: data.id || d.id };
      })
      .filter((p) => notificationPreferencesSchema.safeParse(p).success);
  }

  async upsertPushToken(
    userId: string,
    token: string,
    userAgent?: string | null,
  ): Promise<PushDeviceToken> {
    const snap = await this.db
      .collection(COL.pushDeviceTokens)
      .where("token", "==", token)
      .limit(1)
      .get();

    const now = nowIso();
    if (!snap.empty) {
      const doc = snap.docs[0]!;
      const existing = doc.data() as PushDeviceToken;
      const next: PushDeviceToken = {
        ...existing,
        id: existing.id || doc.id,
        userId,
        token,
        platform: "web",
        userAgent: userAgent ?? existing.userAgent ?? null,
        dateUpdated: now,
        dateCreated: existing.dateCreated || now,
      };
      const valid = assertValidToken(next);
      await this.db.collection(COL.pushDeviceTokens).doc(valid.id).set(valid);
      return valid;
    }

    const row: PushDeviceToken = {
      id: createId("pushtoken"),
      userId,
      token,
      platform: "web",
      userAgent: userAgent ?? null,
      dateCreated: now,
      dateUpdated: now,
    };
    const valid = assertValidToken(row);
    await this.db.collection(COL.pushDeviceTokens).doc(valid.id).set(valid);

    const MAX_TOKENS_PER_USER = 3;
    const userTokens = await this.db
      .collection(COL.pushDeviceTokens)
      .where("userId", "==", userId)
      .get();
    if (userTokens.size > MAX_TOKENS_PER_USER) {
      const sorted = userTokens.docs
        .map((d) => d.data() as PushDeviceToken)
        .sort((a, b) => a.dateCreated.localeCompare(b.dateCreated));
      const drop = sorted.slice(0, sorted.length - MAX_TOKENS_PER_USER);
      const batch = this.db.batch();
      for (const t of drop) {
        batch.delete(this.db.collection(COL.pushDeviceTokens).doc(t.id));
      }
      await batch.commit();
    }

    return valid;
  }

  async deletePushToken(userId: string, token: string): Promise<void> {
    const snap = await this.db
      .collection(COL.pushDeviceTokens)
      .where("userId", "==", userId)
      .where("token", "==", token)
      .limit(5)
      .get();
    const batch = this.db.batch();
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
    }
    if (!snap.empty) await batch.commit();
  }

  async deleteAllPushTokens(userId: string): Promise<void> {
    const snap = await this.db
      .collection(COL.pushDeviceTokens)
      .where("userId", "==", userId)
      .get();
    const batch = this.db.batch();
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
    }
    if (!snap.empty) await batch.commit();
  }

  async listPushTokens(userId: string): Promise<PushDeviceToken[]> {
    const snap = await this.db
      .collection(COL.pushDeviceTokens)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => {
        const data = d.data() as PushDeviceToken;
        return { ...data, id: data.id || d.id };
      })
      .filter((t) => pushDeviceTokenSchema.safeParse(t).success);
  }
}

export function createFirebaseNotificationRepository(): NotificationRepository {
  return new FirebaseNotificationRepository();
}
