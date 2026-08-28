"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Block = {
  id: string;
  label: string;
  minutes: number;
  description: string;
  completed: boolean;
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

  async function complete(blockId: string) {
    setPending(blockId);
    setError(null);
    try {
      const res = await fetch("/api/piano/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, localDay }),
      });
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Could not complete block");
      }
      setLocalBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId ? { ...b, completed: true } : b,
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
    <div className="space-y-3">
      {localBlocks.map((block) => (
        <div
          key={block.id}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-[family-name:var(--font-ui)] text-base font-semibold text-[var(--ink)]">
              {block.label}
              <span className="ml-2 text-xs font-medium text-[var(--ink-muted)]">
                {block.minutes} min
              </span>
            </p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {block.description}
            </p>
          </div>
          {block.completed ? (
            <span className="font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--accent)]">
              Done
            </span>
          ) : (
            <button
              type="button"
              disabled={pending === block.id}
              onClick={() => complete(block.id)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
            >
              {pending === block.id ? "Saving…" : "Complete"}
            </button>
          )}
        </div>
      ))}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
