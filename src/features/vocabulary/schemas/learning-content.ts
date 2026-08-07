import { z } from "zod";

const confidenceSchema = z.enum(["high", "medium", "low"]);

export const vocabularyLearningContentSchema = z
  .object({
    word: z.string().min(1),
    normalizedWord: z.string().min(1),
    partOfSpeech: z.array(z.string().min(1)).min(1).max(6),
    pronunciation: z.object({
      ipa: z.string().nullable().optional(),
      simple: z.string().nullable().optional(),
      confidence: confidenceSchema.optional().nullable(),
    }),
    definitions: z
      .array(
        z.object({
          text: z.string().min(1).max(500),
          sense: z.string().optional().nullable(),
          isPrimary: z.boolean(),
        }),
      )
      .min(1)
      .max(6),
    etymology: z.object({
      summary: z.string().min(1).max(800),
      isUsefulForRootLearning: z.boolean(),
      uncertaintyNote: z.string().nullable().optional(),
      components: z
        .array(
          z.object({
            text: z.string().min(1),
            type: z.enum(["prefix", "root", "stem", "suffix", "other"]),
            origin: z.string().nullable().optional(),
            meaning: z.string().min(1),
            explanation: z.string().min(1),
            relatedWords: z.array(z.string()).max(12),
            confidence: confidenceSchema,
          }),
        )
        .max(8),
    }),
    memoryHook: z.object({
      text: z.string().min(1).max(400),
      type: z.enum(["visual", "sound", "story", "wordplay", "other"]),
    }),
    synonyms: z
      .array(
        z.object({
          word: z.string().min(1),
          note: z.string().nullable().optional(),
        }),
      )
      .min(1)
      .max(12),
    antonyms: z.array(z.string().min(1)).max(12),
    exampleSentences: z
      .array(
        z.object({
          text: z.string().min(1).max(400),
          targetSense: z.string().nullable().optional(),
        }),
      )
      .min(1)
      .max(5),
    wordFamily: z.array(z.string().min(1)).max(12),
    usageNotes: z.string().nullable().optional(),
    confusedWith: z
      .array(
        z.object({
          word: z.string().min(1),
          distinction: z.string().nullable().optional(),
        }),
      )
      .max(8),
  })
  .superRefine((value, ctx) => {
    const primaryCount = value.definitions.filter((d) => d.isPrimary).length;
    if (primaryCount !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Exactly one primary definition is required",
        path: ["definitions"],
      });
    }
  });

export type ValidatedVocabularyLearningContent = z.infer<
  typeof vocabularyLearningContentSchema
>;

export function validateLearningContent(input: unknown) {
  return vocabularyLearningContentSchema.safeParse(input);
}

export function formatLearningContentErrors(
  error: z.ZodError,
): string {
  return error.issues
    .slice(0, 8)
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}
