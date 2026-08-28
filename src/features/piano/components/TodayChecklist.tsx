"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScaleFingeringChart } from "@/features/piano/components/ScaleFingeringChart";
import { ExerciseAskAi } from "@/features/learning/components/ExerciseAskAi";
import type { BlockLessonDetail } from "@/features/piano/services/lesson-detail";

type Block = {
  id: string;
  label: string;
  minutes: number;
  description: string;
  completed: boolean;
  skillId: string;
  skillTitle: string;
  detail: BlockLessonDetail;
};

export function TodayChecklist({
  blocks,
  localDay,
}: {
  blocks: Block[];
  localDay: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState(blocks);

  async function markKeyDone(block: Block) {
    if (!block.detail.trackKeys) return;
    setPending(`${block.id}-key`);
    setError(null);
    try {
      const res = await fetch(`/api/piano/skills/${block.skillId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: block.detail.focusKey, localDay }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Could not mark key");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(null);
    }
  }

  async function complete(block: Block) {
    setPending(`${block.id}-complete`);
    setError(null);
    try {
      const res = await fetch("/api/piano/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: block.id,
          localDay,
          skillIds: [block.skillId],
          ...(block.detail.trackKeys
            ? { markKeyDone: block.detail.focusKey }
            : {}),
        }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Could not complete block");
      }
      setLocalBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, completed: true } : b,
        ),
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      {localBlocks.map((block) => (
        <article
          key={block.id}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="font-[family-name:var(--font-ui)] text-base font-semibold text-[var(--ink)]">
                {block.label}
                <span className="ml-2 text-xs font-medium text-[var(--ink-muted)]">
                  {block.minutes} min
                </span>
              </p>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--ink)]">
                {block.skillTitle}
              </p>
              {block.detail.trackKeys ? (
                <p className="text-sm font-medium text-[var(--accent)]">
                  Today&apos;s key: {block.detail.focusKey} major
                  {block.detail.keysCompleted.includes(block.detail.focusKey)
                    ? " ✓"
                    : ""}
                </p>
              ) : null}
              <p className="text-sm text-[var(--ink-muted)]">{block.detail.why}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {block.completed ? (
                <span className="font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--accent)]">
                  Block done
                </span>
              ) : (
                <button
                  type="button"
                  disabled={pending === `${block.id}-complete`}
                  onClick={() => complete(block)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
                >
                  {pending === `${block.id}-complete`
                    ? "Saving…"
                    : "Complete block"}
                </button>
              )}
              {block.detail.trackKeys &&
              !block.detail.keysCompleted.includes(block.detail.focusKey) ? (
                <button
                  type="button"
                  disabled={pending === `${block.id}-key`}
                  onClick={() => markKeyDone(block)}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
                >
                  {pending === `${block.id}-key`
                    ? "Saving…"
                    : `Mark ${block.detail.focusKey} key done`}
                </button>
              ) : null}
            </div>
          </div>

          {block.detail.trackKeys ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                ...block.detail.keysCompleted,
                ...block.detail.keysRemaining,
              ].sort((a, b) => {
                const order = [
                  "C",
                  "G",
                  "D",
                  "A",
                  "E",
                  "B",
                  "F#",
                  "Db",
                  "Ab",
                  "Eb",
                  "Bb",
                  "F",
                ];
                return order.indexOf(a) - order.indexOf(b);
              }).map((key) => {
                const done = block.detail.keysCompleted.includes(key);
                const today = key === block.detail.focusKey;
                return (
                  <span
                    key={key}
                    className={`rounded-full px-2.5 py-0.5 font-[family-name:var(--font-ui)] text-xs font-medium ${
                      done
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : today
                          ? "border border-[var(--accent)] text-[var(--accent)]"
                          : "border border-[var(--line)] text-[var(--ink-muted)]"
                    }`}
                  >
                    {key}
                    {done ? " ✓" : today ? " · today" : ""}
                  </span>
                );
              })}
              <span className="self-center pl-1 text-xs text-[var(--ink-muted)]">
                {block.detail.keysCompleted.length}/12 keys
              </span>
            </div>
          ) : null}

          {block.detail.tempo ? (
            <div className="mt-4 rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-sm">
              <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--ink)]">
                Tempo
              </p>
              <p className="mt-1 text-[var(--ink-muted)]">
                Start:{" "}
                <strong className="text-[var(--ink)]">
                  {block.detail.tempo.startBpm} BPM
                </strong>{" "}
                ({block.detail.tempo.noteValue}) · Target:{" "}
                <strong className="text-[var(--ink)]">
                  {block.detail.tempo.targetBpm} BPM
                </strong>
              </p>
              <p className="mt-1 text-[var(--ink-muted)]">
                {block.detail.tempo.howToUse}
              </p>
            </div>
          ) : null}

          {block.detail.fingering ? (
            <ScaleFingeringChart fingering={block.detail.fingering} />
          ) : null}

          {block.detail.sources.length > 0 ? (
            <details className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)]/40 px-3 py-2 text-xs">
              <summary className="cursor-pointer font-[family-name:var(--font-ui)] font-semibold text-[var(--ink)]">
                Sources ({block.detail.sources.length})
              </summary>
              <ul className="mt-2 space-y-2">
                {block.detail.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                    >
                      {source.title}
                    </a>
                    {source.note ? (
                      <span className="text-[var(--ink-muted)]">
                        {" "}
                        — {source.note}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--ink)]">
            {block.detail.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-3 text-sm">
            <p>
              <span className="font-[family-name:var(--font-ui)] font-semibold text-[var(--ink)]">
                Exercise:{" "}
              </span>
              <span className="text-[var(--ink-muted)]">
                {block.detail.exercise}
              </span>
            </p>
            <p>
              <span className="font-[family-name:var(--font-ui)] font-semibold text-[var(--ink)]">
                Pass when:{" "}
              </span>
              <span className="text-[var(--ink-muted)]">
                {block.detail.passRule}
              </span>
            </p>
            {block.detail.tip ? (
              <p className="text-[var(--ink-muted)]">
                <span className="font-[family-name:var(--font-ui)] font-semibold text-[var(--ink)]">
                  Tip:{" "}
                </span>
                {block.detail.tip}
              </p>
            ) : null}
            <ExerciseAskAi
              askUrl={`/api/piano/skills/${block.skillId}/ask`}
              body={{ localDay }}
            />
          </div>

          <details className="mt-3 text-xs text-[var(--ink-muted)]">
            <summary className="cursor-pointer font-[family-name:var(--font-ui)] font-medium text-[var(--ink)]">
              Terms explained
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {block.detail.glossary.map((g) => (
                <li key={g.term}>
                  <strong>{g.term}:</strong> {g.meaning}
                </li>
              ))}
            </ul>
          </details>
        </article>
      ))}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
