import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { contentHash, createId, nowIso } from "@/lib/utils";
import { getTextToSpeechProvider } from "@/features/audio/providers";
import { getAudioStorage } from "@/features/audio/providers/storage";
import { requireSentenceUnit } from "@/features/sentence/catalog";
import { getSentenceRepository } from "@/features/sentence/repository";
import { buildSentenceLessonScript } from "@/features/sentence/services/lesson-script";
import type {
  SentenceAudioLesson,
  SentenceProgress,
  SentenceStoredAudioSegment,
  SentenceUnit,
  PublicSentenceUnit,
} from "@/features/sentence/types";
import { toPublicSentenceUnit } from "@/features/sentence/catalog";
import {
  scoreSentenceKnowledgeTest,
  scoreSentenceMicroTask,
} from "@/features/sentence/services/score";
import {
  submitSentenceKnowledgeTestSchema,
  submitSentenceMicroTaskSchema,
} from "@/features/sentence/schemas/unit";

function getUserId() {
  return getEnv().DEFAULT_USER_ID;
}

async function ensureProgressRow(
  userId: string,
  unit: SentenceUnit,
  patch?: Partial<
    Pick<
      SentenceProgress,
      | "status"
      | "microTaskPassed"
      | "knowledgeTestPassed"
      | "lastPlayedAt"
      | "reviewCount"
    >
  >,
): Promise<SentenceProgress> {
  const repo = getSentenceRepository();
  const existing = await repo.getProgress(userId, unit.id);
  const now = nowIso();
  if (!existing) {
    const created: SentenceProgress = {
      id: createId("sprog"),
      userId,
      unitId: unit.id,
      status: patch?.status ?? "not_started",
      microTaskPassed: patch?.microTaskPassed ?? false,
      knowledgeTestPassed: patch?.knowledgeTestPassed ?? false,
      lastPlayedAt: patch?.lastPlayedAt ?? null,
      reviewCount: patch?.reviewCount ?? 0,
      contentHash: unit.contentHash,
      dateUpdated: now,
    };
    return repo.upsertProgress(created);
  }
  const next: SentenceProgress = {
    ...existing,
    knowledgeTestPassed: existing.knowledgeTestPassed ?? false,
    ...patch,
    contentHash: unit.contentHash,
    dateUpdated: now,
  };
  return repo.upsertProgress(next);
}

export async function listUnitsWithProgress(): Promise<{
  units: Array<PublicSentenceUnit & { progress: SentenceProgress | null }>;
}> {
  const { listSentenceUnits } = await import("@/features/sentence/catalog");
  const userId = getUserId();
  const repo = getSentenceRepository();
  const units = await listSentenceUnits();
  const progressRows = await repo.listProgress(userId);
  const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
  return {
    units: units.map((unit) => ({
      ...toPublicSentenceUnit(unit),
      progress: byUnit.get(unit.id) ?? null,
    })),
  };
}

export async function getUnitWithProgress(unitId: string): Promise<{
  unit: PublicSentenceUnit;
  progress: SentenceProgress | null;
}> {
  const unit = await requireSentenceUnit(unitId);
  const progress = await getSentenceRepository().getProgress(
    getUserId(),
    unit.id,
  );
  return { unit: toPublicSentenceUnit(unit), progress };
}

function segmentUsesBrowserFallback(
  segment: SentenceStoredAudioSegment,
): boolean {
  return (
    !segment.audioUrlOrStorageKey ||
    segment.audioUrlOrStorageKey.startsWith("browser:")
  );
}

/** Segments with browser: URLs are playable even if historically marked failed. */
function segmentIsPlayable(segment: SentenceStoredAudioSegment): boolean {
  if (segment.status === "ready") return true;
  return Boolean(segment.audioUrlOrStorageKey?.startsWith("browser:"));
}

function lessonIsCacheable(
  lesson: SentenceAudioLesson,
  voice: string,
): boolean {
  return (
    lesson.voice === voice &&
    lesson.segments.length > 0 &&
    lesson.segments.every(segmentIsPlayable)
  );
}

function normalizePlayableLesson(
  lesson: SentenceAudioLesson,
): SentenceAudioLesson {
  const segments = lesson.segments.map((segment) => {
    if (segment.status === "ready") return segment;
    if (segment.audioUrlOrStorageKey?.startsWith("browser:")) {
      return {
        ...segment,
        status: "ready" as const,
        error: null,
      };
    }
    return segment;
  });
  const allReady = segments.every((s) => s.status === "ready");
  return {
    ...lesson,
    status: allReady ? "ready" : lesson.status,
    segments,
  };
}

export async function ensureSentenceAudioLesson(unitId: string): Promise<{
  lesson: SentenceAudioLesson;
  script: ReturnType<typeof buildSentenceLessonScript>;
  unit: PublicSentenceUnit;
  useBrowserFallback: boolean;
}> {
  const unit = await requireSentenceUnit(unitId);
  const userId = getUserId();
  const repo = getSentenceRepository();
  const script = buildSentenceLessonScript(unit);
  const voice = getEnv().TTS_VOICE;
  const existing = await repo.getAudioLesson(
    userId,
    unit.id,
    unit.contentHash,
  );

  // Auto-load / cache-hit must not bump reviewCount or lastPlayedAt.
  if (existing && lessonIsCacheable(existing, voice)) {
    const lesson = normalizePlayableLesson(existing);
    if (
      lesson.status !== existing.status ||
      lesson.segments.some(
        (s, i) => s.status !== existing.segments[i]?.status,
      )
    ) {
      await repo.saveAudioLesson(lesson);
    }
    return {
      lesson,
      script,
      unit: toPublicSentenceUnit(unit),
      useBrowserFallback: lesson.segments.every(segmentUsesBrowserFallback),
    };
  }

  const tts = getTextToSpeechProvider();
  const storage = getAudioStorage();
  const lessonId = existing?.id ?? createId("slesson");
  const segments: SentenceStoredAudioSegment[] = [];
  let useBrowserFallback = false;

  for (const segment of script) {
    const segmentHash = await contentHash([
      unit.contentHash,
      segment.type,
      segment.text,
      voice,
      tts.name,
    ]);

    const cached = existing?.segments.find(
      (s) =>
        s.segmentType === segment.type &&
        s.contentHash === segmentHash &&
        segmentIsPlayable(s),
    );
    if (cached) {
      const readyCached =
        cached.status === "ready"
          ? cached
          : {
              ...cached,
              status: "ready" as const,
              error: null,
            };
      segments.push(readyCached);
      if (segmentUsesBrowserFallback(readyCached)) {
        useBrowserFallback = true;
      }
      continue;
    }

    try {
      const speech = await tts.generateSpeech({
        text: segment.text,
        voice,
        segmentKey: `${unit.id}_${segment.type}`,
      });

      let audioUrl: string | null = null;
      if (speech.audioBytes && speech.audioBytes.length > 0) {
        const key = `sentence/${unit.id}/${segmentHash}.mp3`;
        audioUrl = await storage.save(key, speech.audioBytes, speech.contentType);
      } else if (speech.useBrowserFallback) {
        audioUrl = `browser:${segmentHash}`;
        useBrowserFallback = true;
      }

      segments.push({
        id: createId("sseg"),
        audioLessonId: lessonId,
        sentenceUnitId: unit.id,
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
      // Browser speech can still play the text — mark ready so ensure does not
      // regenerate forever while TTS is flaky.
      useBrowserFallback = true;
      segments.push({
        id: createId("sseg"),
        audioLessonId: lessonId,
        sentenceUnitId: unit.id,
        segmentKey: `${segment.type}:${segment.order}`,
        segmentType: segment.type,
        order: segment.order,
        text: segment.text,
        audioUrlOrStorageKey: `browser:${segmentHash}`,
        durationMs: null,
        contentHash: segmentHash,
        status: "ready",
        error:
          error instanceof AppError
            ? error.message
            : "Audio generation failed; using browser speech",
      });
    }
  }

  const lesson: SentenceAudioLesson = {
    id: lessonId,
    userId,
    sentenceUnitId: unit.id,
    contentHash: unit.contentHash,
    voice,
    status: "ready",
    createdAt: existing?.createdAt ?? nowIso(),
    segments: segments.sort((a, b) => a.order - b.order),
  };

  await repo.saveAudioLesson(lesson);

  return {
    lesson,
    script,
    unit: toPublicSentenceUnit(unit),
    useBrowserFallback,
  };
}

/** Record a real playback signal — not called from ensure/auto-load. */
export async function recordSentenceLessonPlay(unitId: string): Promise<{
  progress: SentenceProgress;
}> {
  const unit = await requireSentenceUnit(unitId);
  const userId = getUserId();
  const prior = await getSentenceRepository().getProgress(userId, unit.id);
  const progress = await ensureProgressRow(userId, unit, {
    status: prior?.status === "completed" ? "completed" : "in_progress",
    lastPlayedAt: nowIso(),
    reviewCount: (prior?.reviewCount ?? 0) + 1,
    microTaskPassed: prior?.microTaskPassed ?? false,
    knowledgeTestPassed: prior?.knowledgeTestPassed ?? false,
  });
  return { progress };
}

export async function submitUnitMicroTask(
  unitId: string,
  raw: unknown,
): Promise<{
  score: ReturnType<typeof scoreSentenceMicroTask>;
  progress: SentenceProgress;
  unit: PublicSentenceUnit;
}> {
  const parsed = submitSentenceMicroTaskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid micro-task submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const unit = await requireSentenceUnit(unitId);
  const score = scoreSentenceMicroTask(unit, parsed.data.answers);
  const userId = getUserId();
  const prior = await getSentenceRepository().getProgress(userId, unit.id);

  const progress = await ensureProgressRow(userId, unit, {
    status: score.passed
      ? "completed"
      : prior?.status === "completed"
        ? "completed"
        : "in_progress",
    microTaskPassed: score.passed || (prior?.microTaskPassed ?? false),
    knowledgeTestPassed: prior?.knowledgeTestPassed ?? false,
    lastPlayedAt: prior?.lastPlayedAt ?? null,
    reviewCount: prior?.reviewCount ?? 0,
  });

  return {
    score,
    progress,
    unit: toPublicSentenceUnit(unit),
  };
}

export async function submitUnitKnowledgeTest(
  unitId: string,
  raw: unknown,
): Promise<{
  score: ReturnType<typeof scoreSentenceKnowledgeTest>;
  progress: SentenceProgress;
  unit: PublicSentenceUnit;
}> {
  const parsed = submitSentenceKnowledgeTestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid knowledge-test submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const unit = await requireSentenceUnit(unitId);
  if (!unit.knowledgeTest) {
    throw new AppError(
      "This unit has no knowledge test.",
      "NOT_FOUND",
      404,
    );
  }

  const score = scoreSentenceKnowledgeTest(unit, parsed.data.answers);
  const userId = getUserId();
  const prior = await getSentenceRepository().getProgress(userId, unit.id);

  // Knowledge test does not gate status: completed (practice micro-task does).
  const progress = await ensureProgressRow(userId, unit, {
    status: prior?.status ?? "in_progress",
    microTaskPassed: prior?.microTaskPassed ?? false,
    knowledgeTestPassed:
      score.passed || (prior?.knowledgeTestPassed ?? false),
    lastPlayedAt: prior?.lastPlayedAt ?? null,
    reviewCount: prior?.reviewCount ?? 0,
  });

  return {
    score,
    progress,
    unit: toPublicSentenceUnit(unit),
  };
}
