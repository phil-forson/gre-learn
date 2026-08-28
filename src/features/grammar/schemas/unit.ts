import { z } from "zod";
import { LEARNING_LOCALE } from "@/features/learning/types";
import { CEFR_LEVELS } from "@/features/path/types";

const cefrBandSchema = z.enum(CEFR_LEVELS);

export const grammarFormExampleSchema = z.object({
  id: z.string().min(1),
  sentence: z.string().min(1).max(400),
  note: z.string().max(240).optional(),
});

export const grammarFormContentSchema = z.object({
  focus: z.string().min(1).max(200),
  ruleSummary: z.string().min(1).max(800),
  patterns: z.array(z.string().min(1).max(200)).min(1).max(12),
  examples: z.array(grammarFormExampleSchema).min(1).max(12),
  contrastNote: z.string().max(400).optional(),
});

export const grammarMicroTaskChoiceSchema = z.object({
  id: z.string().min(1).max(32),
  text: z.string().min(1).max(200),
});

export const grammarMicroTaskItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["mcq", "cloze"]),
  prompt: z.string().min(1).max(400),
  choices: z.array(grammarMicroTaskChoiceSchema).min(2).max(6),
  correctChoiceId: z.string().min(1).max(32),
});

export const grammarMicroTaskSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1).max(400),
    items: z.array(grammarMicroTaskItemSchema).min(3).max(5),
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

export const grammarKnowledgeTestChoiceSchema = z.object({
  id: z.string().min(1).max(32),
  text: z.string().min(1).max(200),
});

export const grammarKnowledgeTestItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["mcq", "cloze", "error_correction"]),
  prompt: z.string().min(1).max(400),
  choices: z.array(grammarKnowledgeTestChoiceSchema).min(2).max(6),
  correctChoiceId: z.string().min(1).max(32),
});

export const grammarKnowledgeTestSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(160),
    prompt: z.string().min(1).max(400),
    items: z.array(grammarKnowledgeTestItemSchema).min(8).max(12),
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

export const grammarUnitSchema = z.object({
  id: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  cefrBand: cefrBandSchema,
  locale: z.literal(LEARNING_LOCALE),
  strandTags: z.array(z.string().min(1).max(80)).min(1).max(8),
  contentVersion: z.number().int().positive(),
  contentHash: z.string().min(8).max(64),
  form: grammarFormContentSchema,
  microTask: grammarMicroTaskSchema,
  knowledgeTest: grammarKnowledgeTestSchema.optional(),
});

export const grammarProgressSchema = z.object({
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

const grammarSegmentTypeSchema = z.enum([
  "title",
  "focus",
  "rule",
  "pattern",
  "example",
  "contrast",
  "task_lead_in",
]);

const audioStatusSchema = z.enum(["pending", "ready", "failed", "stale"]);

export const grammarStoredAudioSegmentSchema = z.object({
  id: z.string().min(1),
  audioLessonId: z.string().min(1),
  grammarUnitId: z.string().min(1),
  segmentKey: z.string().min(1),
  segmentType: grammarSegmentTypeSchema,
  order: z.number().int().nonnegative(),
  text: z.string().min(1),
  audioUrlOrStorageKey: z.string().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
  contentHash: z.string().min(1),
  status: audioStatusSchema,
  error: z.string().nullable(),
});

export const grammarAudioLessonSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  grammarUnitId: z.string().min(1),
  contentHash: z.string().min(1),
  voice: z.string().min(1),
  status: audioStatusSchema,
  createdAt: z.string().min(1),
  segments: z.array(grammarStoredAudioSegmentSchema),
});

export const submitGrammarMicroTaskSchema = z.object({
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

export const submitGrammarKnowledgeTestSchema = z.object({
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

export const generateGrammarAudioSchema = z.object({
  unitId: z.string().min(1),
});

export type ValidatedGrammarUnit = z.infer<typeof grammarUnitSchema>;
export type ValidatedGrammarProgress = z.infer<typeof grammarProgressSchema>;
export type ValidatedGrammarAudioLesson = z.infer<
  typeof grammarAudioLessonSchema
>;
export type SubmitGrammarMicroTaskInput = z.infer<
  typeof submitGrammarMicroTaskSchema
>;
export type SubmitGrammarKnowledgeTestInput = z.infer<
  typeof submitGrammarKnowledgeTestSchema
>;

export function validateGrammarUnit(data: unknown) {
  return grammarUnitSchema.safeParse(data);
}

export function validateGrammarProgress(data: unknown) {
  return grammarProgressSchema.safeParse(data);
}

export function validateGrammarAudioLesson(data: unknown) {
  return grammarAudioLessonSchema.safeParse(data);
}
