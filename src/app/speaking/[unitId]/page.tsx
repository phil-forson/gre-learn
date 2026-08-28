"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { SpeakingAudioPlayer } from "@/features/speaking/components/SpeakingAudioPlayer";
import { SpeakingCompletedBadge } from "@/features/speaking/components/SpeakingCompletedBadge";
import type {
  SpeakingProgress,
  PublicSpeakingUnit,
} from "@/features/speaking/types";

type AnswersMap = Record<string, string>;

type ScoreResult = {
  correctCount: number;
  itemCount: number;
  passed: boolean;
  itemResults: Array<{
    itemId: string;
    correct: boolean;
    correctChoiceId: string;
  }>;
};

export default function SpeakingUnitPage() {
  const params = useParams<{ unitId: string }>();
  const unitId = params.unitId;
  const [unit, setUnit] = useState<PublicSpeakingUnit | null>(null);
  const [progress, setProgress] = useState<SpeakingProgress | null>(null);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [justPassedPractice, setJustPassedPractice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/speaking/units/${unitId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load");
    setUnit(data.unit);
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

  function submitMicroTask() {
    if (!unit) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          answers: unit.microTask.items.map((item) => ({
            itemId: item.id,
            choiceId: answers[item.id],
          })),
        };
        const res = await fetch(
          `/api/speaking/units/${unit.id}/micro-task`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Submit failed");
        const nextScore = data.score as ScoreResult;
        setScore(nextScore);
        setProgress(data.progress as SpeakingProgress);
        if (nextScore.passed) setJustPassedPractice(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  if (loading) {
    return <p className="text-[var(--ink-muted)]">Loading lesson…</p>;
  }

  if (!unit) {
    return (
      <div className="space-y-4">
        <p className="text-[var(--danger, #b42318)]" role="alert">
          {error ?? "Unit not found"}
        </p>
        <Link href="/path/tracks/speaking" className="text-sm text-[var(--accent)]">
          ← Speaking track
        </Link>
      </div>
    );
  }

  const allAnswered = unit.microTask.items.every((item) => answers[item.id]);
  const completed = progress?.status === "completed";

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Speaking · {unit.cefrBand} · en-US
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            {unit.title}
          </h1>
          <SpeakingCompletedBadge completed={Boolean(completed)} size="md" />
        </div>
        <p className="mt-2 text-[var(--ink-muted)]">{unit.form.focus}</p>
        {progress ? (
          <p className="mt-2 font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
            Progress: {progress.status.replace("_", " ")}
            {progress.microTaskPassed ? " · practice passed" : ""}
            {progress.knowledgeTestPassed ? " · knowledge test passed" : ""}
          </p>
        ) : null}
      </div>

      {justPassedPractice ? (
        <div
          className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3"
          role="status"
        >
          <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--accent)]">
            Practice passed — this unit is complete.
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            You can keep reviewing the lesson anytime
            {unit.knowledgeTest
              ? ", or take the optional knowledge test for a deeper check."
              : "."}
          </p>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Speaking frames
        </h2>
        <p className="text-[var(--ink)]">{unit.form.ruleSummary}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ink-muted)]">
          {unit.form.patterns.map((pattern) => (
            <li key={pattern}>{pattern}</li>
          ))}
        </ul>
        <div className="space-y-2">
          {unit.form.examples.map((example) => (
            <p key={example.id} className="text-sm">
              <span className="text-[var(--ink)]">{example.sentence}</span>
              {example.note ? (
                <span className="text-[var(--ink-muted)]"> — {example.note}</span>
              ) : null}
            </p>
          ))}
        </div>
        {unit.form.contrastNote ? (
          <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--ink-muted)]">
            {unit.form.contrastNote}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Listen
        </h2>
        <SpeakingAudioPlayer
          unitId={unit.id}
          onPlayed={() => {
            void refresh().catch(() => undefined);
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Practice
        </h2>
        <p className="text-sm text-[var(--ink-muted)]">{unit.microTask.prompt}</p>

        <div className="space-y-6">
          {unit.microTask.items.map((item, itemIndex) => {
            const result = score?.itemResults.find((r) => r.itemId === item.id);
            return (
              <div key={item.id} className="space-y-2">
                <p className="font-[family-name:var(--font-ui)] text-sm font-medium">
                  {itemIndex + 1}. {item.prompt}
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
              Score: {score.correctCount}/{score.itemCount}
              {score.passed ? " — passed" : " — try again after reviewing"}
            </p>
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
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={!allAnswered || pending}
            onClick={submitMicroTask}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
          >
            {pending ? "Checking…" : "Check answers"}
          </button>
        )}

        {error ? (
          <p className="text-sm text-[var(--danger, #b42318)]" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {unit.knowledgeTest ? (
        <section className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {unit.knowledgeTest.title}
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Optional deeper check ({unit.knowledgeTest.items.length} items). Pass
            does not change unit completion.
            {progress?.knowledgeTestPassed ? " You already passed this test." : ""}
          </p>
          <Link
            href={`/speaking/${unit.slug}/test`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--accent)]"
          >
            {progress?.knowledgeTestPassed
              ? "Retake knowledge test"
              : "Take knowledge test"}
          </Link>
        </section>
      ) : null}

      <Link href="/path/tracks/speaking" className="text-sm text-[var(--accent)]">
        ← Speaking track
      </Link>
    </div>
  );
}
