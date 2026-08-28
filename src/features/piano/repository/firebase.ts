import {
  pianoProfileSchema,
} from "@/features/piano/schemas/profile";
import {
  pianoSkillProgressSchema,
  practiceSessionSchema,
} from "@/features/piano/schemas/session";
import { youtubeNoteSchema } from "@/features/piano/schemas/note";
import type {
  PianoProfile,
  PianoSkillProgress,
  PracticeSession,
  YoutubeNote,
} from "@/features/piano/types";
import { DAILY_TEMPLATE } from "@/features/piano/curriculum";
import { getDb } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import { createId, nowIso, stripUndefinedDeep } from "@/lib/utils";
import type { PianoRepository } from "./types";

/** Firestore rejects `undefined` field values — always strip before `.set()`. */
function firestoreDoc<T>(data: T): T {
  return stripUndefinedDeep(data);
}

const COL = {
  pianoProfiles: "pianoProfiles",
  pianoSessions: "pianoSessions",
  pianoSkillProgress: "pianoSkillProgress",
  youtubeNotes: "youtubeNotes",
} as const;

function defaultProfile(userId: string): PianoProfile {
  const now = nowIso();
  return {
    id: createId("pianoprofile"),
    userId,
    activePhaseIndex: 0,
    templateId: DAILY_TEMPLATE.id,
    remindersEnabled: true,
    timezone: "UTC",
    continueHint: {
      href: "/piano/today",
      label: "Practice today",
    },
    dateCreated: now,
    dateUpdated: now,
  };
}

function assertValidProfile(profile: PianoProfile): PianoProfile {
  const parsed = pianoProfileSchema.safeParse(profile);
  if (!parsed.success) {
    throw new AppError(
      "Invalid piano profile",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidSession(session: PracticeSession): PracticeSession {
  const parsed = practiceSessionSchema.safeParse(session);
  if (!parsed.success) {
    throw new AppError(
      "Invalid practice session",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidSkillProgress(
  progress: PianoSkillProgress,
): PianoSkillProgress {
  const parsed = pianoSkillProgressSchema.safeParse(progress);
  if (!parsed.success) {
    throw new AppError(
      "Invalid piano skill progress",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidNote(note: YoutubeNote): YoutubeNote {
  const parsed = youtubeNoteSchema.safeParse(note);
  if (!parsed.success) {
    throw new AppError(
      "Invalid YouTube note",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

/** Firebase parity with grammar — Zod on write, userId IDOR guards on read. */
export class FirebasePianoRepository implements PianoRepository {
  private db = getDb();

  async getOrCreateProfile(userId: string): Promise<PianoProfile> {
    const snap = await this.db
      .collection(COL.pianoProfiles)
      .where("userId", "==", userId)
      .limit(1)
      .get();
    if (!snap.empty) {
      const doc = snap.docs[0]!;
      const data = doc.data() as PianoProfile;
      if (data.userId !== userId) {
        throw new AppError("Profile access denied", "FORBIDDEN", 403);
      }
      const parsed = pianoProfileSchema.safeParse(data);
      if (parsed.success) return parsed.data;
      // Repair invalid row in place (same id) — do not spawn orphans.
      const repaired = assertValidProfile({
        ...defaultProfile(userId),
        id: data.id || doc.id,
        userId,
        dateCreated: data.dateCreated || nowIso(),
        dateUpdated: nowIso(),
      });
      await this.db
        .collection(COL.pianoProfiles)
        .doc(repaired.id)
        .set(firestoreDoc(repaired));
      return repaired;
    }
    const fresh = assertValidProfile(defaultProfile(userId));
    await this.db
      .collection(COL.pianoProfiles)
      .doc(fresh.id)
      .set(firestoreDoc(fresh));
    return fresh;
  }

  async upsertProfile(profile: PianoProfile): Promise<PianoProfile> {
    const valid = assertValidProfile(profile);
    const existing = await this.db
      .collection(COL.pianoProfiles)
      .doc(valid.id)
      .get();
    if (existing.exists) {
      const data = existing.data() as PianoProfile;
      if (data.userId !== valid.userId) {
        throw new AppError("Profile access denied", "FORBIDDEN", 403);
      }
      const merged = assertValidProfile({
        ...valid,
        id: data.id,
        userId: data.userId,
        dateCreated: data.dateCreated || valid.dateCreated,
      });
      await this.db
        .collection(COL.pianoProfiles)
        .doc(merged.id)
        .set(firestoreDoc(merged));
      return merged;
    }
    await this.db
      .collection(COL.pianoProfiles)
      .doc(valid.id)
      .set(firestoreDoc(valid));
    return valid;
  }

  async listSessions(userId: string): Promise<PracticeSession[]> {
    const snap = await this.db
      .collection(COL.pianoSessions)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as PracticeSession)
      .filter((s) => s.userId === userId);
  }

  async getSessionByDay(
    userId: string,
    localDay: string,
  ): Promise<PracticeSession | null> {
    const snap = await this.db
      .collection(COL.pianoSessions)
      .where("userId", "==", userId)
      .where("localDay", "==", localDay)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0]!.data() as PracticeSession;
    return data.userId === userId ? data : null;
  }

  async upsertSession(session: PracticeSession): Promise<PracticeSession> {
    const existing = await this.getSessionByDay(
      session.userId,
      session.localDay,
    );
    const next: PracticeSession = existing
      ? {
          ...session,
          id: existing.id,
          userId: existing.userId,
          localDay: existing.localDay,
        }
      : session;
    const valid = assertValidSession(next);
    await this.db
      .collection(COL.pianoSessions)
      .doc(valid.id)
      .set(firestoreDoc(valid));
    return valid;
  }

  async listSkillProgress(userId: string): Promise<PianoSkillProgress[]> {
    const snap = await this.db
      .collection(COL.pianoSkillProgress)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as PianoSkillProgress)
      .filter((p) => p.userId === userId);
  }

  async upsertSkillProgress(
    progress: PianoSkillProgress,
  ): Promise<PianoSkillProgress> {
    const snap = await this.db
      .collection(COL.pianoSkillProgress)
      .where("userId", "==", progress.userId)
      .where("skillId", "==", progress.skillId)
      .limit(1)
      .get();
    const existing = snap.empty
      ? null
      : (snap.docs[0]!.data() as PianoSkillProgress);
    const next: PianoSkillProgress =
      existing && existing.userId === progress.userId
        ? {
            ...progress,
            id: existing.id,
            userId: existing.userId,
            skillId: existing.skillId,
          }
        : progress;
    const valid = assertValidSkillProgress(next);
    await this.db
      .collection(COL.pianoSkillProgress)
      .doc(valid.id)
      .set(firestoreDoc(valid));
    return valid;
  }

  async listNotes(userId: string): Promise<YoutubeNote[]> {
    const snap = await this.db
      .collection(COL.youtubeNotes)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as YoutubeNote)
      .filter((n) => n.userId === userId);
  }

  async getNote(userId: string, noteId: string): Promise<YoutubeNote | null> {
    const doc = await this.db.collection(COL.youtubeNotes).doc(noteId).get();
    if (!doc.exists) return null;
    const data = doc.data() as YoutubeNote;
    return data.userId === userId ? data : null;
  }

  async upsertNote(note: YoutubeNote): Promise<YoutubeNote> {
    const valid = assertValidNote(note);
    const existing = await this.db
      .collection(COL.youtubeNotes)
      .doc(valid.id)
      .get();
    if (existing.exists) {
      const data = existing.data() as YoutubeNote;
      if (data.userId !== valid.userId) {
        throw new AppError("Note access denied", "FORBIDDEN", 403);
      }
      const merged = assertValidNote({
        ...valid,
        id: data.id,
        userId: data.userId,
        dateCreated: data.dateCreated || valid.dateCreated,
      });
      await this.db
        .collection(COL.youtubeNotes)
        .doc(merged.id)
        .set(firestoreDoc(merged));
      return merged;
    }
    await this.db
      .collection(COL.youtubeNotes)
      .doc(valid.id)
      .set(firestoreDoc(valid));
    return valid;
  }
}

export function createFirebasePianoRepository(): PianoRepository {
  return new FirebasePianoRepository();
}
