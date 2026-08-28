import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { contentHash, createId, nowIso } from "@/lib/utils";
import { getTextToSpeechProvider } from "@/features/audio/providers";
import { getAudioStorage } from "@/features/audio/providers/storage";
import { requireGrammarUnit } from "@/features/grammar/catalog";
import { getGrammarRepository } from "@/features/grammar/repository";
import { buildGrammarLessonScript } from "@/features/grammar/services/lesson-script";
import type {
  GrammarAudioLesson,
  GrammarProgress,
  GrammarStoredAudioSegment,
  GrammarUnit,
  PublicGrammarUnit,
} from "@/features/grammar/types";
import { toPublicGrammarUnit } from "@/features/grammar/catalog";
import {
  scoreGrammarKnowledgeTest,
  scoreGrammarMicroTask,
} from "@/features/grammar/services/score";
import {
  submitGrammarKnowledgeTestSchema,
  submitGrammarMicroTaskSchema,
} from "@/features/grammar/schemas/unit";

function getUserId() {
  return getEnv().DEFAULT_USER_ID;
}

async function ensureProgressRow(
  userId: string,
  unit: GrammarUnit,
  patch?: Partial<
    Pick<
      GrammarProgress,
      | "status"
      | "microTaskPassed"
      | "knowledgeTestPassed"
      | "lastPlayedAt"
      | "reviewCount"
    >
  >,
): Promise<GrammarProgress> {
  const repo = getGrammarRepository();
  const existing = await repo.getProgress(userId, unit.id);
  const now = nowIso();
  if (!existing) {
    const created: GrammarProgress = {
      id: createId("gprog"),
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
  const next: GrammarProgress = {
    ...existing,
    knowledgeTestPassed: existing.knowledgeTestPassed ?? false,
    ...patch,
    contentHash: unit.contentHash,
    dateUpdated: now,
  };
  return repo.upsertProgress(next);
}

export async function listUnitsWithProgress(): Promise<{
  units: Array<PublicGrammarUnit & { progress: GrammarProgress | null }>;
}> {
  const { listGrammarUnits } = await import("@/features/grammar/catalog");
  const userId = getUserId();
  const repo = getGrammarRepository();
  const units = await listGrammarUnits();
  const progressRows = await repo.listProgress(userId);
  const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
  return {
    units: units.map((unit) => ({
      ...toPublicGrammarUnit(unit),
      progress: byUnit.get(unit.id) ?? null,
    })),
  };
}

export async function getUnitWithProgress(unitId: string): Promise<{
  unit: PublicGrammarUnit;
  progress: GrammarProgress | null;
}> {
  const unit = await requireGrammarUnit(unitId);
  const progress = await getGrammarRepository().getProgress(
    getUserId(),
    unit.id,
  );
  return { unit: toPublicGrammarUnit(unit), progress };
}

function segmentUsesBrowserFallback(
  segment: GrammarStoredAudioSegment,
): boolean {
  return (
    !segment.audioUrlOrStorageKey ||
    segment.audioUrlOrStorageKey.startsWith("browser:")
  );
}

/** Segments with browser: URLs are playable even if historically marked failed. */
function segmentIsPlayable(segment: GrammarStoredAudioSegment): boolean {
  if (segment.status === "ready") return true;
  return Boolean(segment.audioUrlOrStorageKey?.startsWith("browser:"));
}

function lessonIsCacheable(
  lesson: GrammarAudioLesson,
  voice: string,
): boolean {
  return (
    lesson.voice === voice &&
    lesson.segments.length > 0 &&
    lesson.segments.every(segmentIsPlayable)
  );
}

function normalizePlayableLesson(
  lesson: GrammarAudioLesson,
): GrammarAudioLesson {
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

export async function ensureGrammarAudioLesson(unitId: string): Promise<{
  lesson: GrammarAudioLesson;
  script: ReturnType<typeof buildGrammarLessonScript>;
  unit: PublicGrammarUnit;
  useBrowserFallback: boolean;
}> {
  const unit = await requireGrammarUnit(unitId);
  const userId = getUserId();
  const repo = getGrammarRepository();
  const script = buildGrammarLessonScript(unit);
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
      unit: toPublicGrammarUnit(unit),
      useBrowserFallback: lesson.segments.every(segmentUsesBrowserFallback),
    };
  }

  const tts = getTextToSpeechProvider();
  const storage = getAudioStorage();
  const lessonId = existing?.id ?? createId("glesson");
  const segments: GrammarStoredAudioSegment[] = [];
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
        const key = `grammar/${unit.id}/${segmentHash}.mp3`;
        audioUrl = await storage.save(key, speech.audioBytes, speech.contentType);
      } else if (speech.useBrowserFallback) {
        audioUrl = `browser:${segmentHash}`;
        useBrowserFallback = true;
      }

      segments.push({
        id: createId("gseg"),
        audioLessonId: lessonId,
        grammarUnitId: unit.id,
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
        id: createId("gseg"),
        audioLessonId: lessonId,
        grammarUnitId: unit.id,
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

  const lesson: GrammarAudioLesson = {
    id: lessonId,
    userId,
    grammarUnitId: unit.id,
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
    unit: toPublicGrammarUnit(unit),
    useBrowserFallback,
  };
}

/** Record a real playback signal — not called from ensure/auto-load. */
export async function recordGrammarLessonPlay(unitId: string): Promise<{
  progress: GrammarProgress;
}> {
  const unit = await requireGrammarUnit(unitId);
  const userId = getUserId();
  const prior = await getGrammarRepository().getProgress(userId, unit.id);
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
  score: ReturnType<typeof scoreGrammarMicroTask>;
  progress: GrammarProgress;
  unit: PublicGrammarUnit;
}> {
  const parsed = submitGrammarMicroTaskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid micro-task submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const unit = await requireGrammarUnit(unitId);
  const score = scoreGrammarMicroTask(unit, parsed.data.answers);
  const userId = getUserId();
  const prior = await getGrammarRepository().getProgress(userId, unit.id);

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
    unit: toPublicGrammarUnit(unit),
  };
}

export async function submitUnitKnowledgeTest(
  unitId: string,
  raw: unknown,
): Promise<{
  score: ReturnType<typeof scoreGrammarKnowledgeTest>;
  progress: GrammarProgress;
  unit: PublicGrammarUnit;
}> {
  const parsed = submitGrammarKnowledgeTestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid knowledge-test submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const unit = await requireGrammarUnit(unitId);
  if (!unit.knowledgeTest) {
    throw new AppError(
      "This unit has no knowledge test.",
      "NOT_FOUND",
      404,
    );
  }

  const score = scoreGrammarKnowledgeTest(unit, parsed.data.answers);
  const userId = getUserId();
  const prior = await getGrammarRepository().getProgress(userId, unit.id);

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
    unit: toPublicGrammarUnit(unit),
  };
}
