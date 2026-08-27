"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function BatchAddForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [results, setResults] = useState<
    Array<{ word: string; ok: boolean; duplicate?: boolean; error?: string }>
  >([]);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || pending) return;
    setPending(true);
    setResults([]);
    try {
      const response = await fetch("/api/vocabulary/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Batch failed");
      setResults(
        data.results.map(
          (r: {
            word: string;
            ok: boolean;
            duplicate?: boolean;
            error?: string;
          }) => ({
            word: r.word,
            ok: r.ok,
            duplicate: r.duplicate,
            error: r.error,
          }),
        ),
      );
      setText("");
      router.refresh();
    } catch (error) {
      setResults([
        {
          word: "batch",
          ok: false,
          error: error instanceof Error ? error.message : "Batch failed",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label
        htmlFor="batch"
        className="block font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--ink-muted)]"
      >
        Batch add (one word per line or comma-separated)
      </label>
      <textarea
        id="batch"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={"laconic\nobdurate\npellucid"}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 font-[family-name:var(--font-ui)] text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Processing…" : "Add batch"}
      </button>
      {results.length ? (
        <ul className="space-y-1 font-[family-name:var(--font-ui)] text-sm">
          {results.map((r, i) => (
            <li key={`${r.word}-${i}`} className={r.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}>
              {r.word}:{" "}
              {r.ok
                ? r.duplicate
                  ? "already saved"
                  : "added"
                : r.error ?? "failed"}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
