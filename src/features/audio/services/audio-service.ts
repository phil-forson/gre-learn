import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { contentHash, createId, nowIso } from "@/lib/utils";
import { buildAudioLessonScript } from "@/features/audio/services/lesson-script";
import { getTextToSpeechProvider } from "@/features/audio/providers";
import { getAudioStorage } from "@/features/audio/providers/storage";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import type {
  AudioLesson,
  StoredAudioSegment,
  VocabularyEntry,
} from "@/features/vocabulary/types";

function getUserId() {
  return getEnv().DEFAULT_USER_ID;
}

export async function ensureAudioLesson(
  vocabularyId: string,
): Promise<{
  lesson: AudioLesson;
  script: ReturnType<typeof buildAudioLessonScript>;
  entry: VocabularyEntry;
  useBrowserFallback: boolean;
}> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const entry = await repo.getById(userId, vocabularyId);
  if (!entry) throw new AppError("Word not found.", "NOT_FOUND", 404);
  if (!entry.content || !entry.contentHash) {
    throw new AppError(
      "This word is not ready for audio yet.",
      "CONTENT_NOT_READY",
      400,
    );
  }

  const script = buildAudioLessonScript(entry.content);
  const voice = getEnv().TTS_VOICE;
  const existing = await repo.getAudioLesson(entry.id, entry.contentHash);
  if (
    existing &&
    existing.status === "ready" &&
    existing.voice === voice &&
    existing.segments.every((s) => s.status === "ready")
  ) {
    return {
      lesson: existing,
      script,
      entry,
      useBrowserFallback: existing.segments.every(
        (s) => !s.audioUrlOrStorageKey || s.audioUrlOrStorageKey.startsWith("browser:"),
      ),
    };
  }

  const tts = getTextToSpeechProvider();
  const storage = getAudioStorage();
  const lessonId = existing?.id ?? createId("lesson");
  const segments: StoredAudioSegment[] = [];
  let anyFailed = false;
  let useBrowserFallback = false;

  for (const segment of script) {
    const segmentHash = await contentHash([
      entry.contentHash,
      segment.type,
      segment.text,
      voice,
      tts.name,
    ]);

    const cached = existing?.segments.find(
      (s) =>
        s.segmentType === segment.type &&
        s.contentHash === segmentHash &&
        s.status === "ready",
    );
    if (cached) {
      segments.push(cached);
      if (!cached.audioUrlOrStorageKey || cached.audioUrlOrStorageKey.startsWith("browser:")) {
        useBrowserFallback = true;
      }
      continue;
    }

    try {
      const speech = await tts.generateSpeech({
        text: segment.text,
        voice,
        segmentKey: `${entry.id}_${segment.type}`,
      });

      let audioUrl: string | null = null;
      if (speech.audioBytes && speech.audioBytes.length > 0) {
        const key = `${entry.id}/${segmentHash}.mp3`;
        audioUrl = await storage.save(key, speech.audioBytes, speech.contentType);
      } else if (speech.useBrowserFallback) {
        audioUrl = `browser:${segmentHash}`;
        useBrowserFallback = true;
      }

      segments.push({
        id: createId("seg"),
        audioLessonId: lessonId,
        vocabularyEntryId: entry.id,
        segmentKey: `${segment.type}:${segment.order}`,
        segmentType: segment.type,
        order: segment.order,
        text: segment.text,
        audioUrlOrStorageKey: audioUrl,
        durationMs: speech.durationMs,
        contentHash: segmentHash,
        status: "ready",
        error: null,
      });
    } catch (error) {
      anyFailed = true;
      segments.push({
        id: createId("seg"),
        audioLessonId: lessonId,
        vocabularyEntryId: entry.id,
        segmentKey: `${segment.type}:${segment.order}`,
        segmentType: segment.type,
        order: segment.order,
        text: segment.text,
        audioUrlOrStorageKey: `browser:fallback`,
        durationMs: null,
        contentHash: segmentHash,
        status: "failed",
        error:
          error instanceof AppError
            ? error.message
            : "Audio generation failed for this segment",
      });
      useBrowserFallback = true;
    }
  }

  const lesson: AudioLesson = {
    id: lessonId,
    vocabularyEntryId: entry.id,
    contentHash: entry.contentHash,
    voice,
    status: anyFailed ? "failed" : "ready",
    createdAt: nowIso(),
    segments: segments.sort((a, b) => a.order - b.order),
  };

  await repo.saveAudioLesson(lesson);
  await repo.update(userId, entry.id, {
    audioStatus: anyFailed ? "failed" : "ready",
    audioError: anyFailed
      ? "Some audio segments failed; browser speech may be used."
      : null,
    status: anyFailed ? "audio_failed" : "audio_ready",
    dateUpdated: nowIso(),
  });

  const updated = (await repo.getById(userId, entry.id))!;
  return { lesson, script, entry: updated, useBrowserFallback };
}

export async function recordReviewEvent(
  vocabularyEntryId: string,
  action: "played" | "completed",
) {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const entry = await repo.getById(userId, vocabularyEntryId);
  if (!entry) throw new AppError("Word not found.", "NOT_FOUND", 404);

  if (action === "completed") {
    await repo.update(userId, vocabularyEntryId, {
      lastReviewedAt: nowIso(),
      reviewCount: entry.reviewCount + 1,
      dateUpdated: nowIso(),
    });
  }

  return repo.addReviewEvent({
    id: createId("review"),
    userId,
    vocabularyEntryId,
    playedAt: nowIso(),
    action,
  });
}

export async function getReviewQueue(
  mode: "all" | "shuffle" | "recent" | "favorites",
  options?: { groupId?: string | null; excludeId?: string | null },
) {
  const { buildReviewQueue } = await import("@/features/review/services/queue");
  const repo = getVocabularyRepository();
  const entries = await repo.listEligibleForReview(getUserId());
  return buildReviewQueue(entries, mode, {
    groupId: options?.groupId ?? undefined,
    excludeId: options?.excludeId ?? undefined,
  });
}
