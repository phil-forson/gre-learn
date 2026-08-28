/** Canonical parts hashed for stale detection (excludes contentHash itself). */
export function speakingUnitHashParts(unit: {
  id: string;
  slug: string;
  title: string;
  cefrBand: string;
  locale: string;
  strandTags: readonly string[];
  contentVersion: number;
  form: {
    focus: string;
    ruleSummary: string;
    patterns: readonly string[];
    examples: ReadonlyArray<{
      id: string;
      sentence: string;
      note?: string;
    }>;
    contrastNote?: string;
  };
  microTask: {
    id: string;
    prompt: string;
    items: ReadonlyArray<{
      id: string;
      kind: string;
      prompt: string;
      correctChoiceId: string;
      choices: ReadonlyArray<{ id: string; text: string }>;
    }>;
  };
  knowledgeTest?: {
    id: string;
    title: string;
    prompt: string;
    items: ReadonlyArray<{
      id: string;
      kind: string;
      prompt: string;
      correctChoiceId: string;
      choices: ReadonlyArray<{ id: string; text: string }>;
    }>;
  };
}): Array<string | number> {
  const knowledgeParts = unit.knowledgeTest
    ? [
        unit.knowledgeTest.id,
        unit.knowledgeTest.title,
        unit.knowledgeTest.prompt,
        unit.knowledgeTest.items
          .map(
            (i) =>
              `${i.id}:${i.kind}:${i.prompt}:${i.correctChoiceId}:${i.choices
                .map((c) => `${c.id}=${c.text}`)
                .join(",")}`,
          )
          .join("|"),
      ]
    : [];

  return [
    unit.id,
    unit.slug,
    unit.title,
    unit.cefrBand,
    unit.locale,
    unit.strandTags.join(","),
    unit.contentVersion,
    unit.form.focus,
    unit.form.ruleSummary,
    unit.form.patterns.join("|"),
    unit.form.examples
      .map((e) => `${e.id}:${e.sentence}:${e.note ?? ""}`)
      .join("|"),
    unit.form.contrastNote ?? "",
    unit.microTask.id,
    unit.microTask.prompt,
    unit.microTask.items
      .map(
        (i) =>
          `${i.id}:${i.kind}:${i.prompt}:${i.correctChoiceId}:${i.choices
            .map((c) => `${c.id}=${c.text}`)
            .join(",")}`,
      )
      .join("|"),
    ...knowledgeParts,
  ];
}
