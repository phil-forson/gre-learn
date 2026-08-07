import Link from "next/link";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { StatusBadge } from "./StatusBadge";

export function WordListItem({ entry }: { entry: VocabularyEntry }) {
  const failed = entry.status === "generation_failed";
  const definition =
    entry.content?.definitions.find((d) => d.isPrimary)?.text ??
    entry.content?.definitions[0]?.text ??
    null;
  const subtitle = failed
    ? (entry.generationError
        ? entry.generationError.slice(0, 180) +
          (entry.generationError.length > 180 ? "…" : "")
        : "Generation failed. Open the word to retry.")
    : definition ?? "Content pending…";

  return (
    <li>
      <Link
        href={`/words/${entry.id}`}
        className={`block rounded-2xl border px-4 py-4 transition ${
          failed
            ? "border-red-200/80 bg-red-50/40 hover:border-red-300"
            : "border-[var(--line)] bg-[var(--paper-elevated)]/90 hover:border-[var(--accent)]/30"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--ink)]">
              {entry.word}
              {entry.isFavorite ? (
                <span className="ml-2 text-sm text-[var(--hook)]" aria-label="Favorite">
                  ★
                </span>
              ) : null}
            </h3>
            <p className="mt-1 font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
              {entry.partOfSpeech.join(" · ") || "—"}
            </p>
          </div>
          <StatusBadge status={entry.status} />
        </div>
        <p
          className={`mt-2 text-[15px] leading-relaxed line-clamp-2 ${
            failed ? "text-[var(--danger)]" : "text-[var(--ink-muted)]"
          }`}
        >
          {subtitle}
        </p>
      </Link>
    </li>
  );
}
