import type { VocabularyStatus } from "@/features/vocabulary/types";

const labels: Record<VocabularyStatus, string> = {
  pending: "Pending",
  generating: "Generating",
  ready: "Ready",
  generation_failed: "Generation failed",
  audio_pending: "Audio pending",
  audio_ready: "Audio ready",
  audio_failed: "Audio failed",
};

export function StatusBadge({ status }: { status: VocabularyStatus }) {
  const failed = status.includes("failed");
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 font-[family-name:var(--font-ui)] text-[11px] font-medium uppercase tracking-wide ${
        failed
          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
          : status === "ready" || status === "audio_ready"
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "bg-[var(--overlay)] text-[var(--ink-muted)]"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
