"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { YoutubeNote } from "@/features/piano/types";

function isYoutubeUrl(value: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(value.trim());
}

export function NotesClient({ initialNotes }: { initialNotes: YoutubeNote[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [rawText, setRawText] = useState("");
  const [url, setUrl] = useState("");
  const [channelHint, setChannelHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Saving…");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedText = rawText.trim();
    if (!trimmedUrl && !trimmedText) return;

    setBusy(true);
    setError(null);
    setBusyLabel(trimmedUrl && !trimmedText ? "Fetching transcript…" : "Saving…");
    try {
      const body: Record<string, string | boolean> = {};
      if (trimmedText) body.rawText = trimmedText;
      if (trimmedUrl) body.url = trimmedUrl;
      if (channelHint.trim()) body.channelHint = channelHint.trim();
      if (trimmedUrl) body.mapToPlan = true;

      const res = await fetch("/api/piano/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        note?: YoutubeNote;
        error?: { message?: string };
      };
      if (!res.ok || !json.note) {
        throw new Error(json.error?.message ?? "Could not save note");
      }
      setNotes((prev) => [json.note!, ...prev.filter((n) => n.id !== json.note!.id)]);
      setRawText("");
      setUrl("");
      setChannelHint("");
      setExpandedId(json.note.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function mapNote(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/piano/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "map" }),
      });
      const json = (await res.json()) as {
        note?: YoutubeNote;
        error?: { message?: string };
      };
      if (!res.ok || !json.note) {
        throw new Error(json.error?.message ?? "Could not map note");
      }
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? json.note! : n)),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = Boolean(url.trim() || rawText.trim());

  return (
    <div className="space-y-8">
      <form onSubmit={createNote} className="space-y-3">
        <label className="block space-y-1">
          <span className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            YouTube link
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <p className="text-xs text-[var(--ink-muted)]">
            We fetch the caption transcript, summarize it, and add it to
            today&apos;s plan for review.
          </p>
        </label>
        <label className="block space-y-1">
          <span className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            Extra notes (optional)
          </span>
          <textarea
            rows={4}
            maxLength={20_000}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            placeholder="Or paste your own timestamps and takeaways — overrides the transcript if both are filled."
          />
        </label>
        <label className="block space-y-1 sm:max-w-xs">
          <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
            Channel hint (optional)
          </span>
          <input
            type="text"
            value={channelHint}
            onChange={(e) => setChannelHint(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            placeholder="HearAndPlay, PianoGroove…"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
        >
          {busy ? busyLabel : url.trim() ? "Extract & add to lessons" : "Save note"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {notes.length === 0 ? (
          <li className="text-[var(--ink-muted)]">No notes yet.</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                  {note.status}
                </span>
                {note.channelHint ? (
                  <span className="text-xs text-[var(--ink-muted)]">
                    · {note.channelHint}
                  </span>
                ) : null}
                {note.url && isYoutubeUrl(note.url) ? (
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] underline-offset-4 hover:underline"
                  >
                    Watch on YouTube
                  </a>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-[var(--ink)]">{note.summary}</p>
              {note.practicePrompts.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ink-muted)]">
                  {note.practicePrompts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setExpandedId((id) => (id === note.id ? null : note.id))
                }
                className="mt-3 font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)] underline-offset-4 hover:underline"
              >
                {expandedId === note.id ? "Hide transcript" : "Review transcript"}
              </button>
              {expandedId === note.id ? (
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-xs leading-relaxed text-[var(--ink-muted)]">
                  {note.rawText}
                </pre>
              ) : null}
              {note.status === "inbox" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => mapNote(note.id)}
                  className="mt-3 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline disabled:opacity-60"
                >
                  Map to today&apos;s plan
                </button>
              ) : note.status === "mapped" ? (
                <p className="mt-3 text-xs text-[var(--ink-muted)]">
                  On{" "}
                  <Link href="/piano/today" className="text-[var(--accent)] hover:underline">
                    today&apos;s plan
                  </Link>{" "}
                  for review.
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
