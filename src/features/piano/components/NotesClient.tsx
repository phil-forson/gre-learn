"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { YoutubeNote } from "@/features/piano/types";

export function NotesClient({ initialNotes }: { initialNotes: YoutubeNote[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [rawText, setRawText] = useState("");
  const [url, setUrl] = useState("");
  const [channelHint, setChannelHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, string> = { rawText };
      if (url.trim()) body.url = url.trim();
      if (channelHint.trim()) body.channelHint = channelHint.trim();
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
      setNotes((prev) => [json.note!, ...prev]);
      setRawText("");
      setUrl("");
      setChannelHint("");
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

  return (
    <div className="space-y-8">
      <form onSubmit={createNote} className="space-y-3">
        <label className="block space-y-1">
          <span className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            Paste YouTube notes
          </span>
          <textarea
            required
            rows={6}
            maxLength={20_000}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            placeholder="Paste timestamps and takeaways — no scraping, paste only."
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
              URL (optional)
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
              placeholder="https://youtube.com/..."
            />
          </label>
          <label className="block space-y-1">
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
        </div>
        <button
          type="submit"
          disabled={busy || !rawText.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save note"}
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
              </div>
              <p className="mt-2 text-sm text-[var(--ink)]">{note.summary}</p>
              {note.practicePrompts.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ink-muted)]">
                  {note.practicePrompts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
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
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
