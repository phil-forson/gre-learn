import Link from "next/link";
import { NotesClient } from "@/features/piano/components/NotesClient";
import { listYoutubeNotes } from "@/features/piano/services/notes-service";

export const dynamic = "force-dynamic";

export default async function PianoNotesPage() {
  const notes = await listYoutubeNotes();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="font-[family-name:var(--font-ui)] text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          <Link href="/piano" className="hover:text-[var(--ink)]">
            Piano
          </Link>
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          YouTube notes
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)]">
          Paste lesson notes (HearAndPlay, PianoGroove, etc.). We summarize and
          tag skills — no scraping.
        </p>
      </section>

      <NotesClient initialNotes={notes} />
    </div>
  );
}
