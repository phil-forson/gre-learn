import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { contentHash, createId, nowIso } from "@/lib/utils";
import { getTextToSpeechProvider } from "@/features/audio/providers";
import { getAudioStorage } from "@/features/audio/providers/storage";
import { requireSpeakingUnit } from "@/features/speaking/catalog";
import { getSpeakingRepository } from "@/features/speaking/repository";
import { buildSpeakingLessonScript } from "@/features/speaking/services/lesson-script";
import type {
  SpeakingAudioLesson,
  SpeakingProgress,
  SpeakingStoredAudioSegment,
  SpeakingUnit,
  PublicSpeakingUnit,
} from "@/features/speaking/types";
import { toPublicSpeakingUnit } from "@/features/speaking/catalog";
import {
  scoreSpeakingKnowledgeTest,
  scoreSpeakingMicroTask,
} from "@/features/speaking/services/score";
import {
  submitSpeakingKnowledgeTestSchema,
  submitSpeakingMicroTaskSchema,
} from "@/features/speaking/schemas/unit";

function getUserId() {
  return getEnv().DEFAULT_USER_ID;
}

async function ensureProgressRow(
  userId: string,
  unit: SpeakingUnit,
  patch?: Partial<
    Pick<
      SpeakingProgress,
      | "status"
      | "microTaskPassed"
      | "knowledgeTestPassed"
      | "lastPlayedAt"
      | "reviewCount"
    >
  >,
): Promise<SpeakingProgress> {
  const repo = getSpeakingRepository();
  const existing = await repo.getProgress(userId, unit.id);
  const now = nowIso();
  if (!existing) {
    const created: SpeakingProgress = {
      id: createId("spkprog"),
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
  const next: SpeakingProgress = {
    ...existing,
    knowledgeTestPassed: existing.knowledgeTestPassed ?? false,
    ...patch,
    contentHash: unit.contentHash,
    dateUpdated: now,
  };
  return repo.upsertProgress(next);
}

export async function listUnitsWithProgress(): Promise<{
  units: Array<PublicSpeakingUnit & { progress: SpeakingProgress | null }>;
}> {
  const { listSpeakingUnits } = await import("@/features/speaking/catalog");
  const userId = getUserId();
  const repo = getSpeakingRepository();
  const units = await listSpeakingUnits();
  const progressRows = await repo.listProgress(userId);
  const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
  return {
    units: units.map((unit) => ({
      ...toPublicSpeakingUnit(unit),
      progress: byUnit.get(unit.id) ?? null,
    })),
  };
}

export async function getUnitWithProgress(unitId: string): Promise<{
  unit: PublicSpeakingUnit;
  progress: SpeakingProgress | null;
}> {
  const unit = await requireSpeakingUnit(unitId);
  const progress = await getSpeakingRepository().getProgress(
    getUserId(),
    unit.id,
  );
  return { unit: toPublicSpeakingUnit(unit), progress };
}

function segmentUsesBrowserFallback(
  segment: SpeakingStoredAudioSegment,
): boolean {
  return (
    !segment.audioUrlOrStorageKey ||
    segment.audioUrlOrStorageKey.startsWith("browser:")
  );
}

/** Segments with browser: URLs are playable even if historically marked failed. */
function segmentIsPlayable(segment: SpeakingStoredAudioSegment): boolean {
  if (segment.status === "ready") return true;
  return Boolean(segment.audioUrlOrStorageKey?.startsWith("browser:"));
}

function lessonIsCacheable(
  lesson: SpeakingAudioLesson,
  voice: string,
): boolean {
  return (
    lesson.voice === voice &&
    lesson.segments.length > 0 &&
    lesson.segments.every(segmentIsPlayable)
  );
}

function normalizePlayableLesson(
  lesson: SpeakingAudioLesson,
): SpeakingAudioLesson {
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

export async function ensureSpeakingAudioLesson(unitId: string): Promise<{
  lesson: SpeakingAudioLesson;
  script: ReturnType<typeof buildSpeakingLessonScript>;
  unit: PublicSpeakingUnit;
  useBrowserFallback: boolean;
}> {
  const unit = await requireSpeakingUnit(unitId);
  const userId = getUserId();
  const repo = getSpeakingRepository();
  const script = buildSpeakingLessonScript(unit);
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
      unit: toPublicSpeakingUnit(unit),
      useBrowserFallback: lesson.segments.every(segmentUsesBrowserFallback),
    };
  }

  const tts = getTextToSpeechProvider();
  const storage = getAudioStorage();
  const lessonId = existing?.id ?? createId("spklesson");
  const segments: SpeakingStoredAudioSegment[] = [];
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
        const key = `speaking/${unit.id}/${segmentHash}.mp3`;
        audioUrl = await storage.save(key, speech.audioBytes, speech.contentType);
      } else if (speech.useBrowserFallback) {
        audioUrl = `browser:${segmentHash}`;
        useBrowserFallback = true;
      }

      segments.push({
        id: createId("spkseg"),
        audioLessonId: lessonId,
        speakingUnitId: unit.id,
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
        id: createId("spkseg"),
        audioLessonId: lessonId,
        speakingUnitId: unit.id,
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

  const lesson: SpeakingAudioLesson = {
    id: lessonId,
    userId,
    speakingUnitId: unit.id,
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
    unit: toPublicSpeakingUnit(unit),
    useBrowserFallback,
  };
}

/** Record a real playback signal — not called from ensure/auto-load. */
export async function recordSpeakingLessonPlay(unitId: string): Promise<{
  progress: SpeakingProgress;
}> {
  const unit = await requireSpeakingUnit(unitId);
  const userId = getUserId();
  const prior = await getSpeakingRepository().getProgress(userId, unit.id);
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
  score: ReturnType<typeof scoreSpeakingMicroTask>;
  progress: SpeakingProgress;
  unit: PublicSpeakingUnit;
}> {
  const parsed = submitSpeakingMicroTaskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid micro-task submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const unit = await requireSpeakingUnit(unitId);
  const score = scoreSpeakingMicroTask(unit, parsed.data.answers);
  const userId = getUserId();
  const prior = await getSpeakingRepository().getProgress(userId, unit.id);

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
    unit: toPublicSpeakingUnit(unit),
  };
}

export async function submitUnitKnowledgeTest(
  unitId: string,
  raw: unknown,
): Promise<{
  score: ReturnType<typeof scoreSpeakingKnowledgeTest>;
  progress: SpeakingProgress;
  unit: PublicSpeakingUnit;
}> {
  const parsed = submitSpeakingKnowledgeTestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid knowledge-test submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const unit = await requireSpeakingUnit(unitId);
  if (!unit.knowledgeTest) {
    throw new AppError(
      "This unit has no knowledge test.",
      "NOT_FOUND",
      404,
    );
  }

  const score = scoreSpeakingKnowledgeTest(unit, parsed.data.answers);
  const userId = getUserId();
  const prior = await getSpeakingRepository().getProgress(userId, unit.id);

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
    unit: toPublicSpeakingUnit(unit),
  };
}
