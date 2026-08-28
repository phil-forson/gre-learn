import { DAILY_TEMPLATE } from "@/features/piano/curriculum";
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
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import type { PianoRepository } from "./types";

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

export type LocalPianoRepositoryOptions = {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
};

export class LocalPianoRepository implements PianoRepository {
  private readonly vocabRepo: LocalVocabularyRepository;

  constructor(options?: LocalPianoRepositoryOptions) {
    this.vocabRepo =
      options?.vocabRepo ??
      new LocalVocabularyRepository({ dataDir: options?.dataDir });
  }

  async getOrCreateProfile(userId: string): Promise<PianoProfile> {
    const existing = await this.vocabRepo.getPianoProfile(userId);
    if (existing) {
      const parsed = pianoProfileSchema.safeParse(existing);
      if (parsed.success) return parsed.data;
      const fresh = { ...defaultProfile(userId), id: existing.id };
      return this.vocabRepo.upsertPianoProfile(assertValidProfile(fresh));
    }
    return this.vocabRepo.upsertPianoProfile(
      assertValidProfile(defaultProfile(userId)),
    );
  }

  async upsertProfile(profile: PianoProfile): Promise<PianoProfile> {
    return this.vocabRepo.upsertPianoProfile(assertValidProfile(profile));
  }

  listSessions(userId: string) {
    return this.vocabRepo.listPianoSessions(userId);
  }

  getSessionByDay(userId: string, localDay: string) {
    return this.vocabRepo.getPianoSessionByDay(userId, localDay);
  }

  async upsertSession(session: PracticeSession): Promise<PracticeSession> {
    return this.vocabRepo.upsertPianoSession(assertValidSession(session));
  }

  listSkillProgress(userId: string) {
    return this.vocabRepo.listPianoSkillProgress(userId);
  }

  async upsertSkillProgress(
    progress: PianoSkillProgress,
  ): Promise<PianoSkillProgress> {
    return this.vocabRepo.upsertPianoSkillProgress(
      assertValidSkillProgress(progress),
    );
  }

  listNotes(userId: string) {
    return this.vocabRepo.listYoutubeNotes(userId);
  }

  getNote(userId: string, noteId: string) {
    return this.vocabRepo.getYoutubeNote(userId, noteId);
  }

  async upsertNote(note: YoutubeNote): Promise<YoutubeNote> {
    return this.vocabRepo.upsertYoutubeNote(assertValidNote(note));
  }
}
