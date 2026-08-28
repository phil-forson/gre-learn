/** Online source backing a learning item shown to the user. */
export type LearningSource = {
  title: string;
  /** Public https URL the user can verify. */
  url: string;
  /** What this source supports (fingerings, tempo, CEFR scope, etc.). */
  note?: string;
};

export function isLearningSource(value: unknown): value is LearningSource {
  if (!value || typeof value !== "object") return false;
  const s = value as LearningSource;
  return (
    typeof s.title === "string" &&
    s.title.length > 0 &&
    typeof s.url === "string" &&
    /^https?:\/\/.+/i.test(s.url)
  );
}

export function formatLearningSource(source: LearningSource): string {
  return `${source.title} (${source.url})`;
}
