import { z } from "zod";
import { LEARNING_LOCALE } from "@/features/learning/types";
import { CEFR_LEVELS } from "@/features/path/types";

const cefrBandSchema = z.enum(CEFR_LEVELS);

export const sentenceFormExampleSchema = z.object({
  id: z.string().min(1),
  sentence: z.string().min(1).max(400),
  note: z.string().max(240).optional(),
});

export const sentenceFormContentSchema = z.object({
  focus: z.string().min(1).max(200),
  ruleSummary: z.string().min(1).max(800),
  patterns: z.array(z.string().min(1).max(200)).min(1).max(12),
  examples: z.array(sentenceFormExampleSchema).min(1).max(12),
  contrastNote: z.string().max(400).optional(),
});

export const sentenceMicroTaskChoiceSchema = z.object({
  id: z.string().min(1).max(32),
  text: z.string().min(1).max(200),
});

export const sentenceMicroTaskItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["mcq", "cloze"]),
  prompt: z.string().min(1).max(400),
  choices: z.array(sentenceMicroTaskChoiceSchema).min(2).max(6),
  correctChoiceId: z.string().min(1).max(32),
});

export const sentenceMicroTaskSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1).max(400),
    items: z.array(sentenceMicroTaskItemSchema).min(3).max(5),
  })
  .superRefine((task, ctx) => {
    for (const item of task.items) {
      if (!item.choices.some((c) => c.id === item.correctChoiceId)) {
        ctx.addIssue({
          code: "custom",
          message: `correctChoiceId must match a choice on item ${item.id}`,
          path: ["items"],
        });
      }
    }
  });

export const sentenceKnowledgeTestChoiceSchema = z.object({
  id: z.string().min(1).max(32),
  text: z.string().min(1).max(200),
});

export const sentenceKnowledgeTestItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["mcq", "cloze", "error_correction"]),
  prompt: z.string().min(1).max(400),
  choices: z.array(sentenceKnowledgeTestChoiceSchema).min(2).max(6),
  correctChoiceId: z.string().min(1).max(32),
});

export const sentenceKnowledgeTestSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(160),
    prompt: z.string().min(1).max(400),
    items: z.array(sentenceKnowledgeTestItemSchema).min(8).max(12),
  })
  .superRefine((task, ctx) => {
    for (const item of task.items) {
      if (!item.choices.some((c) => c.id === item.correctChoiceId)) {
        ctx.addIssue({
          code: "custom",
          message: `correctChoiceId must match a choice on item ${item.id}`,
          path: ["items"],
        });
      }
    }
  });

export const sentenceUnitSchema = z.object({
  id: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  cefrBand: cefrBandSchema,
  locale: z.literal(LEARNING_LOCALE),
  strandTags: z.array(z.string().min(1).max(80)).min(1).max(8),
  contentVersion: z.number().int().positive(),
  contentHash: z.string().min(8).max(64),
  form: sentenceFormContentSchema,
  microTask: sentenceMicroTaskSchema,
  knowledgeTest: sentenceKnowledgeTestSchema.optional(),
});

export const sentenceProgressSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  unitId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "completed"]),
  microTaskPassed: z.boolean(),
  knowledgeTestPassed: z.boolean().default(false),
  lastPlayedAt: z.string().nullable(),
  reviewCount: z.number().int().nonnegative(),
  contentHash: z.string().min(1),
  dateUpdated: z.string().min(1),
});

const sentenceSegmentTypeSchema = z.enum([
  "title",
  "focus",
  "rule",
  "pattern",
  "example",
  "contrast",
  "task_lead_in",
]);

const audioStatusSchema = z.enum(["pending", "ready", "failed", "stale"]);

export const sentenceStoredAudioSegmentSchema = z.object({
  id: z.string().min(1),
  audioLessonId: z.string().min(1),
  sentenceUnitId: z.string().min(1),
  segmentKey: z.string().min(1),
  segmentType: sentenceSegmentTypeSchema,
  order: z.number().int().nonnegative(),
  text: z.string().min(1),
  audioUrlOrStorageKey: z.string().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
  contentHash: z.string().min(1),
  status: audioStatusSchema,
  error: z.string().nullable(),
});

export const sentenceAudioLessonSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  sentenceUnitId: z.string().min(1),
  contentHash: z.string().min(1),
  voice: z.string().min(1),
  status: audioStatusSchema,
  createdAt: z.string().min(1),
  segments: z.array(sentenceStoredAudioSegmentSchema),
});

export const submitSentenceMicroTaskSchema = z.object({
  answers: z
    .array(
      z.object({
        itemId: z.string().min(1),
        choiceId: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
});

export const submitSentenceKnowledgeTestSchema = z.object({
  answers: z
    .array(
      z.object({
        itemId: z.string().min(1),
        choiceId: z.string().min(1),
      }),
    )
    .min(1)
    .max(12),
});

export const generateSentenceAudioSchema = z.object({
  unitId: z.string().min(1),
});

export type ValidatedSentenceUnit = z.infer<typeof sentenceUnitSchema>;
export type ValidatedSentenceProgress = z.infer<typeof sentenceProgressSchema>;
export type ValidatedSentenceAudioLesson = z.infer<
  typeof sentenceAudioLessonSchema
>;
export type SubmitSentenceMicroTaskInput = z.infer<
  typeof submitSentenceMicroTaskSchema
>;
export type SubmitSentenceKnowledgeTestInput = z.infer<
  typeof submitSentenceKnowledgeTestSchema
>;

export function validateSentenceUnit(data: unknown) {
  return sentenceUnitSchema.safeParse(data);
}

export function validateSentenceProgress(data: unknown) {
  return sentenceProgressSchema.safeParse(data);
}

export function validateSentenceAudioLesson(data: unknown) {
  return sentenceAudioLessonSchema.safeParse(data);
}
