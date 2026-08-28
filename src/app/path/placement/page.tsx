"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SKIP_DEFAULT_CEFR } from "@/features/path/catalog";
import type {
  LearningProfile,
  PlacementResult,
  PublicPlacementItem,
} from "@/features/path/types";

type AnswersMap = Record<string, string>;

export default function PlacementPage() {
  const router = useRouter();
  const [items, setItems] = useState<PublicPlacementItem[]>([]);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [skippedLevel, setSkippedLevel] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/path/placement");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load");
        if (!cancelled) {
          setItems(data.items ?? []);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = items[index];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = items.length > 0 && answeredCount === items.length;

  function selectChoice(choiceId: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceId }));
  }

  function submit(payload: unknown) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/path/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Submit failed");
        const profile = data.profile as LearningProfile;
        if (data.skipped) {
          setSkippedLevel(profile.cefrLevel ?? SKIP_DEFAULT_CEFR);
          setResult(null);
        } else {
          setResult(data.result as PlacementResult);
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  if (loading) {
    return (
      <p className="text-[var(--ink-muted)]">Loading placement…</p>
    );
  }

  if (skippedLevel || result) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {skippedLevel ? "Placement skipped" : "Placement complete"}
        </h1>
        {skippedLevel ? (
          <p className="text-[var(--ink-muted)]">
            We set your level to <strong>{skippedLevel}</strong> so you can
            continue. Retake anytime from your path.
          </p>
        ) : result ? (
          <p className="text-[var(--ink-muted)]">
            Recommended level:{" "}
            <strong>{result.recommendedLevel}</strong> ({result.correctCount}/
            {result.itemCount} correct).
          </p>
        ) : null}
        <Link
          href="/path"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
        >
          Back to path
        </Link>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="text-[var(--ink-muted)]">No placement items available.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Placement
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Short American English check — about {items.length} questions. No
          account pressure; skip if you already know your level.
        </p>
      </div>

      <div className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
        Question {index + 1} of {items.length}
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5">
        <p className="text-lg leading-relaxed">{current.prompt}</p>
        <ul className="space-y-2">
          {current.choices.map((choice) => {
            const selected = answers[current.id] === choice.id;
            return (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => selectChoice(choice.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left font-[family-name:var(--font-ui)] text-sm transition-colors ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--overlay)]"
                  }`}
                >
                  {choice.text}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={index === 0 || pending}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="min-h-11 rounded-xl border border-[var(--line)] px-4 font-[family-name:var(--font-ui)] text-sm disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={index >= items.length - 1 || pending}
            onClick={() =>
              setIndex((i) => Math.min(items.length - 1, i + 1))
            }
            className="min-h-11 rounded-xl border border-[var(--line)] px-4 font-[family-name:var(--font-ui)] text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit({ skip: true })}
            className="min-h-11 rounded-xl border border-[var(--line)] px-4 font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)]"
          >
            Skip (use {SKIP_DEFAULT_CEFR})
          </button>
          <button
            type="button"
            disabled={!allAnswered || pending}
            onClick={() =>
              submit({
                answers: items.map((item) => ({
                  itemId: item.id,
                  choiceId: answers[item.id]!,
                })),
              })
            }
            className="min-h-11 rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-40"
          >
            {pending ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
