import Link from "next/link";
import type { VocabularyEntry, WordGroup } from "@/features/vocabulary/types";
import { GroupAssignSelect } from "./GroupAssignSelect";
import { StatusBadge } from "./StatusBadge";

type Props = {
  entry: VocabularyEntry;
  groupName?: string | null;
  groups?: WordGroup[];
};

export function WordListItem({ entry, groupName, groups = [] }: Props) {
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
      <div
        className={`rounded-2xl border px-4 py-4 transition ${
          failed
            ? "border-[var(--danger)]/35 bg-[var(--danger-soft)]"
            : "border-[var(--line)] bg-[var(--paper-elevated)]/90"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Link href={`/words/${entry.id}`} className="min-w-0 flex-1">
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
          {groups.length ? (
            <div className="shrink-0">
              <GroupAssignSelect
                vocabularyId={entry.id}
                groupId={entry.groupId}
                groups={groups}
                compact
              />
            </div>
          ) : null}
        </div>
        {groupName ? (
          <p className="mt-2 font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-wide text-[var(--accent)]">
            {groupName}
          </p>
        ) : null}
      </div>
    </li>
  );
}
