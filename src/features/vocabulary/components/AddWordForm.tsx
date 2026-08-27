"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useId, useState } from "react";

type Props = {
  autofocus?: boolean;
};

export function AddWordForm({ autofocus = true }: Props) {
  const router = useRouter();
  const id = useId();
  const [word, setWord] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!word.trim() || pending) return;
    setPending(true);
    setError(null);
    setDuplicateId(null);
    setStatus("Adding…");
    const submitted = word.trim();
    setWord("");

    try {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: submitted }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message ?? "Could not add word");
      }
      if (data.duplicate) {
        setStatus(
          `“${data.entry.word}” is already saved (using cached content — no AI call).`,
        );
        setDuplicateId(data.entry.id);
      } else if (data.entry.status === "generation_failed") {
        setStatus(null);
        setError(
          data.entry.generationError
            ? `“${data.entry.word}”: ${String(data.entry.generationError).slice(0, 220)} — try adding again`
            : `Generation failed for “${data.entry.word}”. Try adding it again.`,
        );
        setDuplicateId(data.entry.id);
      } else {
        setStatus(
          data.retried
            ? `Retry worked: ${data.entry.word} is ready & cached`
            : `Ready: ${data.entry.word} (generated once & cached)`,
        );
        setDuplicateId(data.entry.id);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add word");
      setStatus(null);
      setWord(submitted);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-elevated)] p-4 shadow-[var(--shadow)] sm:p-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={id}>
          Add a word you just encountered
        </label>
        <input
          id={id}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          autoFocus={autofocus}
          autoComplete="off"
          placeholder="Add a word you just encountered…"
          className="min-h-12 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 font-[family-name:var(--font-ui)] text-base text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>
      {status ? (
        <p
          className="mt-3 font-[family-name:var(--font-ui)] text-sm text-[var(--accent)]"
          role="status"
        >
          {status}
          {duplicateId ? (
            <>
              {" "}
              <a className="underline underline-offset-2" href={`/words/${duplicateId}`}>
                Open word
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 font-[family-name:var(--font-ui)] text-sm text-[var(--danger)]" role="alert">
          {error}
          {duplicateId ? (
            <>
              {" "}
              <a
                className="underline underline-offset-2"
                href={`/words/${duplicateId}`}
              >
                Open word
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
