"use client";

import { useState } from "react";
import type { GroundedAskResponse } from "@/features/learning/schemas/grounded-ask";

type Props = {
  askUrl: string;
  /** Optional extra body fields (e.g. localDay for piano). */
  body?: Record<string, string>;
  disabled?: boolean;
};

export function ExerciseAskAi({ askUrl, body, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GroundedAskResponse | null>(null);

  async function submit() {
    const trimmed = question.trim();
    if (trimmed.length < 3) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(askUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, ...body }),
      });
      const json = (await res.json()) as {
        error?: { message?: string };
      } & Partial<GroundedAskResponse>;
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Could not get an answer");
      }
      setResult({
        answer: json.answer ?? "",
        citedSourceTitles: json.citedSourceTitles ?? [],
        cannotAnswer: Boolean(json.cannotAnswer),
        provider: json.provider === "openai" ? "openai" : "mock",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)]/50 px-3 py-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--accent)] disabled:opacity-50"
      >
        {open ? "Hide Ask AI" : "Ask AI about this exercise"}
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[var(--ink-muted)]">
            Answers use only this lesson, glossary, and cited sources — not
            general web knowledge.
          </p>
          <label className="block space-y-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-medium text-[var(--ink)]">
              Your question
            </span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="e.g. What does hands together mean here?"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            />
          </label>
          <button
            type="button"
            disabled={pending || question.trim().length < 3}
            onClick={() => void submit()}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
          >
            {pending ? "Thinking…" : "Ask"}
          </button>
          {result ? (
            <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm">
              <p className="text-[var(--ink)]">{result.answer}</p>
              {result.citedSourceTitles.length > 0 ? (
                <p className="text-xs text-[var(--ink-muted)]">
                  Sources used: {result.citedSourceTitles.join("; ")}
                </p>
              ) : null}
              {result.cannotAnswer ? (
                <p className="text-xs text-[var(--ink-muted)]">
                  Not in today&apos;s reference pack — check the Sources links
                  above.
                </p>
              ) : null}
              <p className="text-xs text-[var(--ink-muted)]">
                {result.provider === "openai" ?
                  "Grounded AI (OpenAI)"
                : "Offline hint (enable OpenAI for full answers)"}
              </p>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
