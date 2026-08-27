"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VocabularyEntry, WordGroup } from "@/features/vocabulary/types";
import { GroupAssignSelect } from "./GroupAssignSelect";
import { StatusBadge } from "./StatusBadge";

export function WordDetailCard({
  entry: initial,
  groups = [],
}: {
  entry: VocabularyEntry;
  groups?: WordGroup[];
}) {
  const router = useRouter();
  const [entry, setEntry] = useState(initial);
  const [note, setNote] = useState(entry.personalNote ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSecondary, setShowSecondary] = useState(false);

  const content = entry.content;
  const primary =
    content?.definitions.find((d) => d.isPrimary) ?? content?.definitions[0];
  const commonLink = content?.synonyms.find(
    (s) => s.note?.trim().toLowerCase() === "common link",
  );
  const regularSynonyms =
    content?.synonyms.filter(
      (s) => s.note?.trim().toLowerCase() !== "common link",
    ) ?? [];
  const isManual = entry.generationProvider === "manual";

  async function patch(body: Record<string, unknown>) {
    setBusy(String(body.action));
    setMessage(null);
    try {
      const response = await fetch(`/api/vocabulary/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Action failed");
      setEntry(data.entry);
      if (body.action === "note") setMessage("Note saved.");
      if (body.action === "regenerate") setMessage("Content regenerated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm(`Delete “${entry.word}”?`)) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/vocabulary/${entry.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message ?? "Delete failed");
      }
      router.push("/library");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
      setBusy(null);
    }
  }

  return (
    <article className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.status} />
          {entry.isDemo ? (
            <span className="rounded-full bg-[var(--overlay)] px-2.5 py-1 font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
              Demo data
            </span>
          ) : null}
          {isManual ? (
            <span className="rounded-full bg-[var(--overlay)] px-2.5 py-1 font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
              Your notes
            </span>
          ) : null}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
          {entry.word}
        </h1>
        {content?.pronunciation?.simple || content?.pronunciation?.ipa ? (
          <p className="font-[family-name:var(--font-ui)] text-[var(--ink-muted)]">
            {content.pronunciation.simple}
            {content.pronunciation.ipa ? (
              <span className="ml-2 text-sm opacity-80">
                {content.pronunciation.ipa}
              </span>
            ) : null}
          </p>
        ) : null}
        <p className="font-[family-name:var(--font-ui)] text-sm uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          {entry.partOfSpeech.join(" · ") || content?.partOfSpeech.join(" · ")}
        </p>
        {groups.length ? (
          <GroupAssignSelect
            vocabularyId={entry.id}
            groupId={entry.groupId}
            groups={groups}
          />
        ) : null}
      </header>

      <section
        className={`rounded-2xl border p-5 shadow-[var(--shadow)] ${
          entry.status === "generation_failed"
            ? "border-[var(--danger)]/35 bg-[var(--danger-soft)]"
            : "border-[var(--line)] bg-[var(--paper-elevated)]"
        }`}
      >
        <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          {entry.status === "generation_failed" ? "Error" : "Definition"}
        </h2>
        <p
          className={`mt-2 text-lg leading-relaxed ${
            entry.status === "generation_failed" ? "text-[var(--danger)]" : ""
          }`}
        >
          {primary?.text ??
            entry.generationError ??
            (entry.status === "generating" ? "Generating…" : "No definition yet.")}
        </p>
        {entry.status === "generation_failed" ? (
          <p className="mt-2 font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)]">
            OpenAI returned invalid structure or the request failed. Try{" "}
            <button
              type="button"
              onClick={() => patch({ action: "regenerate" })}
              disabled={busy === "regenerate"}
              className="font-medium text-[var(--accent)] underline underline-offset-2"
            >
              Regenerate
            </button>
            .
          </p>
        ) : null}
      </section>

      {content ? (
        <>
          <section className="rounded-2xl border border-[var(--root)]/15 bg-[var(--root-soft)] p-5">
            <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--root)]">
              Root / Origin
            </h2>
            <p className="mt-2 leading-relaxed text-[var(--ink)]">
              {content.etymology.summary}
            </p>
            {content.etymology.uncertaintyNote ? (
              <p className="mt-2 text-sm italic text-[var(--ink-muted)]">
                {content.etymology.uncertaintyNote}
              </p>
            ) : null}
            {content.etymology.components.length ? (
              <ul className="mt-3 space-y-2">
                {content.etymology.components.map((c) => (
                  <li
                    key={`${c.text}-${c.meaning}`}
                    className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{c.text}</span>
                    <span className="text-[var(--ink-muted)]"> · {c.type}</span>
                    <div className="mt-1">{c.meaning}</div>
                    <div className="text-[var(--ink-muted)]">{c.explanation}</div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--hook)]/20 bg-[var(--hook-soft)] p-5">
            <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hook)]">
              Memory Hook
            </h2>
            <p className="mt-2 leading-relaxed">{content.memoryHook.text}</p>
            {!isManual ? (
              <p className="mt-2 font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--hook)]/80">
                Invented mnemonic · not linguistic origin
              </p>
            ) : null}
          </section>

          {commonLink ? (
            <section>
              <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                Common Link
              </h2>
              <p className="mt-2 font-[family-name:var(--font-ui)] text-lg">
                {commonLink.word}
              </p>
            </section>
          ) : null}

          {regularSynonyms.length ? (
            <section>
              <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                Synonyms
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {regularSynonyms.map((s) => (
                  <span
                    key={s.word}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-[family-name:var(--font-ui)] text-sm"
                    title={s.note ?? undefined}
                  >
                    {s.word}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--surface-muted)] py-3 pl-4 pr-3">
            <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Example
            </h2>
            <p className="mt-2 text-lg italic leading-relaxed">
              “{content.exampleSentences[0]?.text}”
            </p>
          </section>

          <button
            type="button"
            onClick={() => setShowSecondary((v) => !v)}
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--accent)] underline-offset-2 hover:underline"
          >
            {showSecondary ? "Hide secondary details" : "Show more details"}
          </button>

          {showSecondary ? (
            <div className="space-y-4 rounded-2xl border border-[var(--line)] p-4">
              {content.antonyms.length ? (
                <div>
                  <h3 className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    Antonyms
                  </h3>
                  <p className="mt-1">{content.antonyms.join(", ")}</p>
                </div>
              ) : null}
              {content.wordFamily.length ? (
                <div>
                  <h3 className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    Word family
                  </h3>
                  <p className="mt-1">{content.wordFamily.join(", ")}</p>
                </div>
              ) : null}
              {content.usageNotes ? (
                <div>
                  <h3 className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    Usage notes
                  </h3>
                  <p className="mt-1">{content.usageNotes}</p>
                </div>
              ) : null}
              {content.confusedWith.length ? (
                <div>
                  <h3 className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    Confused with
                  </h3>
                  <ul className="mt-1 space-y-2">
                    {content.confusedWith.map((c) => (
                      <li key={c.word}>
                        <strong>{c.word}</strong>
                        {c.distinction ? ` — ${c.distinction}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      <section className="space-y-2">
        <label
          htmlFor="note"
          className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]"
        >
          Personal note
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 font-[family-name:var(--font-ui)] text-sm"
        />
        <button
          type="button"
          disabled={busy === "note"}
          onClick={() => patch({ action: "note", note })}
          className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm"
        >
          Save note
        </button>
      </section>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/audio?word=${entry.id}`}
          className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
        >
          Play word lesson
        </a>
        <button
          type="button"
          disabled={busy === "favorite"}
          onClick={() => patch({ action: "favorite" })}
          className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm"
        >
          {entry.isFavorite ? "Unfavorite" : "Favorite"}
        </button>
        {!isManual ? (
          <button
            type="button"
            disabled={busy === "regenerate"}
            onClick={() => patch({ action: "regenerate" })}
            className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm"
          >
            {busy === "regenerate" ? "Regenerating…" : "Regenerate"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy === "delete"}
          onClick={remove}
          className="min-h-12 rounded-xl border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-4 font-[family-name:var(--font-ui)] text-sm text-[var(--danger)]"
        >
          Delete
        </button>
      </div>

      {message ? (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)]" role="status">
          {message}
        </p>
      ) : null}
    </article>
  );
}
