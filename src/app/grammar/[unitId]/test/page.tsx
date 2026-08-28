"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type {
  GrammarProgress,
  PublicGrammarUnit,
} from "@/features/grammar/types";

type AnswersMap = Record<string, string>;

type ScoreResult = {
  correctCount: number;
  itemCount: number;
  passThreshold: number;
  passed: boolean;
  itemResults: Array<{
    itemId: string;
    correct: boolean;
    correctChoiceId: string;
  }>;
};

export default function GrammarKnowledgeTestPage() {
  const params = useParams<{ unitId: string }>();
  const router = useRouter();
  const unitId = params.unitId;
  const [unit, setUnit] = useState<PublicGrammarUnit | null>(null);
  const [progress, setProgress] = useState<GrammarProgress | null>(null);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/grammar/units/${unitId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load");
    const nextUnit = data.unit as PublicGrammarUnit;
    if (!nextUnit.knowledgeTest) {
      throw new Error("This unit has no knowledge test.");
    }
    setUnit(nextUnit);
    setProgress(data.progress);
  }, [unitId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
        if (!cancelled) setLoading(false);
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
  }, [refresh]);

  function submitTest() {
    if (!unit?.knowledgeTest) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          answers: unit.knowledgeTest!.items.map((item) => ({
            itemId: item.id,
            choiceId: answers[item.id],
          })),
        };
        const res = await fetch(
          `/api/grammar/units/${unit.id}/knowledge-test`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Submit failed");
        setScore(data.score as ScoreResult);
        setProgress(data.progress as GrammarProgress);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  if (loading) {
    return <p className="text-[var(--ink-muted)]">Loading knowledge test…</p>;
  }

  if (!unit?.knowledgeTest) {
    return (
      <div className="space-y-4">
        <p className="text-[var(--danger, #b42318)]" role="alert">
          {error ?? "Knowledge test not found"}
        </p>
        <Link
          href={`/grammar/${unitId}`}
          className="text-sm text-[var(--accent)]"
        >
          ← Back to lesson
        </Link>
      </div>
    );
  }

  const test = unit.knowledgeTest;
  const allAnswered = test.items.every((item) => answers[item.id]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Knowledge test · {unit.cefrBand}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          {test.title}
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">{unit.title}</p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">{test.prompt}</p>
        <p className="mt-1 font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
          Pass with {Math.ceil(test.items.length * 0.8)} of {test.items.length}{" "}
          correct (80%). Optional — does not change unit completion.
          {progress?.knowledgeTestPassed ? " Previously passed." : ""}
        </p>
      </div>

      <div className="space-y-6">
        {test.items.map((item, itemIndex) => {
          const result = score?.itemResults.find((r) => r.itemId === item.id);
          return (
            <div key={item.id} className="space-y-2">
              <p className="font-[family-name:var(--font-ui)] text-sm font-medium">
                {itemIndex + 1}.{" "}
                <span className="text-[var(--ink-muted)]">
                  [{item.kind.replace("_", " ")}]
                </span>{" "}
                {item.prompt}
              </p>
              <div className="flex flex-col gap-2">
                {item.choices.map((choice) => {
                  const selected = answers[item.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={Boolean(score)}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [item.id]: choice.id,
                        }))
                      }
                      className={`min-h-11 rounded-xl border px-3 text-left font-[family-name:var(--font-ui)] text-sm ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--line)] bg-[var(--surface)]"
                      }`}
                    >
                      {choice.text}
                      {result && choice.id === result.correctChoiceId
                        ? " ✓"
                        : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {score ? (
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-ui)] text-sm">
            Score: {score.correctCount}/{score.itemCount} (need{" "}
            {score.passThreshold})
            {score.passed ? " — passed" : " — not quite; you can retry"}
          </p>
          <div className="flex flex-wrap gap-3">
            {!score.passed ? (
              <button
                type="button"
                onClick={() => {
                  setScore(null);
                  setError(null);
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold"
              >
                Try again
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push(`/grammar/${unit.slug}`)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
              >
                Back to lesson
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setScore(null);
                setAnswers({});
                setError(null);
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold"
            >
              Retake from scratch
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={!allAnswered || pending}
          onClick={submitTest}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
        >
          {pending ? "Checking…" : "Submit knowledge test"}
        </button>
      )}

      {error ? (
        <p className="text-sm text-[var(--danger, #b42318)]" role="alert">
          {error}
        </p>
      ) : null}

      <Link
        href={`/grammar/${unit.slug}`}
        className="text-sm text-[var(--accent)]"
      >
        ← Back to lesson
      </Link>
    </div>
  );
}
