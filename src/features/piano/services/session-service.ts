import { getEnv } from "@/lib/env";
import { getDailyTemplate } from "@/features/piano/catalog";
import { getPianoRepository } from "@/features/piano/repository";
import {
  completeSessionBlockSchema,
} from "@/features/piano/schemas/session";
import type { PracticeSession } from "@/features/piano/types";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import { localDayKey } from "@/features/notifications/services/digest-builder";
import { markKeyComplete } from "@/features/piano/services/skill-service";
import { KEY_TRACKING_SKILL_IDS } from "@/features/piano/services/lesson-detail";
import { getOrCreatePianoProfile } from "./profile-service";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

async function ensureSessionForDay(localDay: string): Promise<PracticeSession> {
  const repo = getPianoRepository();
  const userId = getUserId();
  const existing = await repo.getSessionByDay(userId, localDay);
  if (existing) return existing;
  const profile = await getOrCreatePianoProfile();
  const now = nowIso();
  const template = getDailyTemplate();
  return repo.upsertSession({
    id: createId("pianosession"),
    userId,
    localDay,
    templateId: profile.templateId || template.id,
    blocksCompleted: [],
    skillIdsTouched: [],
    sourceNoteIds: [],
    durationMin: 0,
    dateCreated: now,
    dateUpdated: now,
  });
}

export async function listSessions(): Promise<PracticeSession[]> {
  return getPianoRepository().listSessions(getUserId());
}

export async function completeSessionBlock(
  raw: unknown,
): Promise<PracticeSession> {
  const parsed = completeSessionBlockSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid session block completion",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const profile = await getOrCreatePianoProfile();
  const template = getDailyTemplate();
  const block = template.blocks.find((b) => b.id === parsed.data.blockId);
  if (!block) {
    throw new AppError("Unknown template block", "VALIDATION_ERROR", 400);
  }

  const localDay =
    parsed.data.localDay ??
    localDayKey(new Date(), profile.timezone || "UTC");

  const session = await ensureSessionForDay(localDay);
  const now = nowIso();
  const already = session.blocksCompleted.some(
    (b) => b.blockId === block.id,
  );
  const blocksCompleted = already
    ? session.blocksCompleted
    : [
        ...session.blocksCompleted,
        {
          blockId: block.id,
          completedAt: now,
          ...(parsed.data.notes !== undefined
            ? { notes: parsed.data.notes }
            : {}),
        },
      ];

  const skillIds = new Set(session.skillIdsTouched);
  for (const id of parsed.data.skillIds ?? []) skillIds.add(id);

  const durationMin = template.blocks
    .filter((b) => blocksCompleted.some((c) => c.blockId === b.id))
    .reduce((sum, b) => sum + b.minutes, 0);

  const updated = await getPianoRepository().upsertSession({
    ...session,
    blocksCompleted,
    skillIdsTouched: [...skillIds],
    durationMin,
    dateUpdated: now,
  });

  const primarySkillId = parsed.data.skillIds?.[0];
  const keyToMark = parsed.data.markKeyDone;
  if (
    primarySkillId &&
    keyToMark &&
    KEY_TRACKING_SKILL_IDS.has(primarySkillId)
  ) {
    await markKeyComplete(primarySkillId, { key: keyToMark, localDay });
  }

  return updated;
}
