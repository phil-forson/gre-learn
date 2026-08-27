"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WordGroup } from "@/features/vocabulary/types";
import { GroupPickOrCreate } from "./GroupPickOrCreate";

const PLACEHOLDER = `Austere
Meaning: Very plain, strict, or severe in appearance or manner.
Common Link: Stern
Breakdown: From Greek austeros, meaning "harsh" or "severe."
Memory Trick: Austere = severe and stripped of comfort.
Sentence: The office had an austere design with little decoration.

Obdurate
Meaning: Stubbornly refusing to change one's opinion or course of action.
Common Link: Stubborn
Breakdown: From Latin obdurare — ob (against) + durare (to harden).
Memory Trick: Ob-durate — hardened against change.
Sentence: The obdurate judge refused to reconsider the ruling.`;

export function ManualAddForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [results, setResults] = useState<
    Array<{ word: string; ok: boolean; replaced?: boolean; error?: string }>
  >([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void fetch("/api/word-groups")
      .then((response) => response.json())
      .then((data) => {
        if (data.groups) setGroups(data.groups);
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || pending) return;
    setPending(true);
    setResults([]);
    try {
      const response = await fetch("/api/vocabulary/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          groupId: groupId || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Import failed");
      setResults(
        data.results.map(
          (r: {
            word: string;
            ok: boolean;
            replaced?: boolean;
            error?: string;
          }) => ({
            word: r.word,
            ok: r.ok,
            replaced: r.replaced,
            error: r.error,
          }),
        ),
      );
      setText("");
      router.refresh();
    } catch (error) {
      setResults([
        {
          word: "import",
          ok: false,
          error: error instanceof Error ? error.message : "Import failed",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="manual-cards"
          className="block font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--ink-muted)]"
        >
          Import your own study cards (no AI)
        </label>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Paste words in your personal format. Separate multiple words with a blank
          line. Audio review uses your exact wording.
        </p>
      </div>
      <textarea
        id="manual-cards"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={PLACEHOLDER}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 font-[family-name:var(--font-ui)] text-sm leading-relaxed"
      />
      <GroupPickOrCreate
        id="manual-group"
        groups={groups}
        groupId={groupId}
        onGroupIdChange={setGroupId}
        onGroupsChange={setGroups}
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Importing…" : "Import cards"}
      </button>
      {results.length ? (
        <ul className="space-y-1 font-[family-name:var(--font-ui)] text-sm">
          {results.map((r, i) => (
            <li
              key={`${r.word}-${i}`}
              className={r.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}
            >
              {r.word}:{" "}
              {r.ok
                ? r.replaced
                  ? "replaced with your notes"
                  : "imported"
                : r.error ?? "failed"}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
