type Props = {
  completed: boolean;
  size?: "sm" | "md";
};

/** Visible completion marker for practice-passed sentence units. */
export function SentenceCompletedBadge({ completed, size = "sm" }: Props) {
  if (!completed) return null;

  const sizeClass =
    size === "md"
      ? "px-3 py-1.5 text-xs"
      : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wide text-[var(--on-accent)] ${sizeClass}`}
      aria-label="Completed"
    >
      <span aria-hidden="true">✓</span>
      Completed
    </span>
  );
}
