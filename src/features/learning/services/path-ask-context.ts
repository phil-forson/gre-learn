import {
  buildReferencePack,
  type GroundedAskContext,
} from "@/features/learning/services/grounded-ask-ai";
import type { LearningSource } from "@/lib/learning-source";

type FormLike = {
  focus: string;
  ruleSummary: string;
  patterns: string[];
  examples: Array<{ sentence: string; note?: string }>;
  contrastNote?: string;
};

type MicroTaskLike = {
  prompt: string;
  items: Array<{ prompt: string }>;
};

export function buildPathUnitAskContext(input: {
  title: string;
  form: FormLike;
  microTask: MicroTaskLike;
  sources: LearningSource[];
  cefrBand?: string;
  cefrRange?: string;
}): GroundedAskContext {
  const examples = input.form.examples
    .map(
      (ex, i) =>
        `${i + 1}. ${ex.sentence}${ex.note ? ` (${ex.note})` : ""}`,
    )
    .join("\n");

  return {
    title: input.title,
    exercise: input.microTask.prompt,
    referencePack: buildReferencePack({
      Focus: input.form.focus,
      "Rule summary": input.form.ruleSummary,
      Patterns: input.form.patterns.map((p) => `- ${p}`).join("\n"),
      Examples: examples,
      "Contrast note": input.form.contrastNote,
      CEFR: input.cefrBand ? `${input.cefrBand} (${input.cefrRange ?? input.cefrBand})` : undefined,
      "Practice items": input.microTask.items
        .map((item, i) => `${i + 1}. ${item.prompt}`)
        .join("\n"),
    }),
    sources: input.sources,
    glossary: [],
  };
}
