import type {
  PianoProfile,
  PianoSkillProgress,
  PracticeSession,
  YoutubeNote,
} from "@/features/piano/types";

export interface PianoRepository {
  getOrCreateProfile(userId: string): Promise<PianoProfile>;
  upsertProfile(profile: PianoProfile): Promise<PianoProfile>;

  listSessions(userId: string): Promise<PracticeSession[]>;
  getSessionByDay(
    userId: string,
    localDay: string,
  ): Promise<PracticeSession | null>;
  upsertSession(session: PracticeSession): Promise<PracticeSession>;

  listSkillProgress(userId: string): Promise<PianoSkillProgress[]>;
  upsertSkillProgress(
    progress: PianoSkillProgress,
  ): Promise<PianoSkillProgress>;

  listNotes(userId: string): Promise<YoutubeNote[]>;
  getNote(userId: string, noteId: string): Promise<YoutubeNote | null>;
  upsertNote(note: YoutubeNote): Promise<YoutubeNote>;
}
