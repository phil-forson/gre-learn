import { getEnv } from "@/lib/env";
import { getSkillBySlug } from "@/features/piano/catalog";
import { getPianoRepository } from "@/features/piano/repository";
import {
  createYoutubeNoteSchema,
  patchYoutubeNoteSchema,
} from "@/features/piano/schemas/note";
import type { YoutubeNote } from "@/features/piano/types";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import {
  hashNoteText,
  normalizeNoteText,
  summarizeYoutubeNote,
} from "./note-summarize";
import { getOrCreatePianoProfile } from "./profile-service";
import {
  fetchYoutubeTranscript,
  youtubeWatchUrl,
} from "./youtube-transcript";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export async function listYoutubeNotes(): Promise<YoutubeNote[]> {
  const notes = await getPianoRepository().listNotes(getUserId());
  return notes.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
}

export async function createYoutubeNote(raw: unknown): Promise<YoutubeNote> {
  const parsed = createYoutubeNoteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid YouTube note",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const pastedText = parsed.data.rawText?.trim() ?? "";
  let resolvedText = pastedText;
  let resolvedUrl = parsed.data.url?.trim();
  let fetchedFromYoutube = false;

  if (!resolvedText && resolvedUrl) {
    const transcript = await fetchYoutubeTranscript(resolvedUrl);
    resolvedText = transcript.text;
    resolvedUrl = youtubeWatchUrl(transcript.videoId);
    fetchedFromYoutube = true;
  }

  if (!resolvedText) {
    throw new AppError(
      "Nothing to save — add a YouTube URL or paste notes.",
      "VALIDATION_ERROR",
      400,
    );
  }

  const normalized = normalizeNoteText(resolvedText);
  const contentHash = hashNoteText(normalized);

  const repo = getPianoRepository();
  const existing = await repo.listNotes(getUserId());
  if (existing.some((n) => n.contentHash === contentHash && n.status !== "archived")) {
    throw new AppError(
      "You already saved this lesson (same transcript text).",
      "DUPLICATE_NOTE",
      409,
    );
  }

  const summarized = await summarizeYoutubeNote(normalized);
  const skillTagIds = summarized.skillSlugs
    .map((slug) => getSkillBySlug(slug)?.id)
    .filter((id): id is string => Boolean(id));

  const now = nowIso();
  const note: YoutubeNote = {
    id: createId("ytnote"),
    userId: getUserId(),
    url: resolvedUrl,
    channelHint: parsed.data.channelHint,
    rawText: resolvedText,
    summary: summarized.summary,
    skillTagIds,
    practicePrompts: summarized.practicePrompts,
    status: "inbox",
    contentHash,
    dateCreated: now,
    dateUpdated: now,
  };

  const saved = await repo.upsertNote(note);

  const shouldMap =
    parsed.data.mapToPlan !== false &&
    (fetchedFromYoutube || parsed.data.mapToPlan === true);
  if (shouldMap) {
    return mapNoteToPlan(saved.id);
  }
  return saved;
}

export async function mapNoteToPlan(noteId: string): Promise<YoutubeNote> {
  const repo = getPianoRepository();
  const userId = getUserId();
  const note = await repo.getNote(userId, noteId);
  if (!note) {
    throw new AppError("Note not found", "NOT_FOUND", 404);
  }
  const profile = await getOrCreatePianoProfile();
  const now = nowIso();
  const prompts =
    note.practicePrompts.length > 0
      ? note.practicePrompts
      : [
          "Practice one idea from this note during gospel core or jazz application.",
        ];

  return repo.upsertNote({
    ...note,
    status: "mapped",
    mappedPhaseIndex: profile.activePhaseIndex,
    practicePrompts: prompts,
    dateUpdated: now,
  });
}

export async function patchYoutubeNote(
  noteId: string,
  raw: unknown,
): Promise<YoutubeNote> {
  const parsed = patchYoutubeNoteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid note patch",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const action = parsed.data.action;
  if (action === "map") {
    return mapNoteToPlan(noteId);
  }

  const repo = getPianoRepository();
  const userId = getUserId();
  const note = await repo.getNote(userId, noteId);
  if (!note) {
    throw new AppError("Note not found", "NOT_FOUND", 404);
  }

  if (action === "archive" || parsed.data.status === "archived") {
    return repo.upsertNote({
      ...note,
      status: "archived",
      dateUpdated: nowIso(),
    });
  }

  if (action === "update_tags" || parsed.data.skillTagIds || parsed.data.practicePrompts) {
    return repo.upsertNote({
      ...note,
      skillTagIds: parsed.data.skillTagIds ?? note.skillTagIds,
      practicePrompts: parsed.data.practicePrompts ?? note.practicePrompts,
      status: parsed.data.status ?? note.status,
      dateUpdated: nowIso(),
    });
  }

  if (parsed.data.status) {
    return repo.upsertNote({
      ...note,
      status: parsed.data.status,
      dateUpdated: nowIso(),
    });
  }

  throw new AppError("No updatable fields provided", "VALIDATION_ERROR", 400);
}
