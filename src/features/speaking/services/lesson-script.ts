import type { SpeakingLessonSegment, SpeakingUnit } from "@/features/speaking/types";

/**
 * Deterministic audio lesson script from validated speaking unit content.
 * Transcript and TTS must share this exact object.
 */
export function buildSpeakingLessonScript(
  unit: SpeakingUnit,
): SpeakingLessonSegment[] {
  const segments: SpeakingLessonSegment[] = [];
  let order = 0;

  const push = (
    type: SpeakingLessonSegment["type"],
    text: string,
    pauseAfterMs = 400,
  ) => {
    segments.push({
      id: `${unit.id}_${type}_${order}`,
      type,
      text: text.trim(),
      order,
      pauseAfterMs,
    });
    order += 1;
  };

  push("title", `${unit.title}.`, 450);
  push("focus", `Focus: ${unit.form.focus}.`, 450);
  push("rule", `Rule: ${unit.form.ruleSummary}`, 500);

  for (const pattern of unit.form.patterns) {
    push("pattern", `Pattern: ${pattern}`, 350);
  }

  for (const example of unit.form.examples) {
    const note = example.note?.trim();
    push(
      "example",
      note
        ? `Example: ${example.sentence} ${note}.`
        : `Example: ${example.sentence}`,
      450,
    );
  }

  if (unit.form.contrastNote?.trim()) {
    push("contrast", `Compare: ${unit.form.contrastNote.trim()}`, 450);
  }

  push(
    "task_lead_in",
    "When you are ready, try the short speaking practice on this page.",
    500,
  );

  return segments;
}
