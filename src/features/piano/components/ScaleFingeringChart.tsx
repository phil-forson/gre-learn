import type { FingeringDisplay } from "@/features/piano/curriculum/scale-fingerings";

function HandChart({
  hand,
}: {
  hand: FingeringDisplay["rightHand"];
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--ink)]">
          {hand.label}
        </p>
        <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
          Pattern:{" "}
          <span className="font-medium text-[var(--ink)]">{hand.pattern}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-px rounded-lg border border-[var(--line)] bg-[var(--line)] text-center text-xs"
          style={{
            gridTemplateColumns: `repeat(${hand.notes.length}, minmax(2.25rem, 1fr))`,
          }}
        >
          {hand.notes.map((note, i) => (
            <div
              key={`${note}-${i}-note`}
              className="bg-[var(--surface-muted)] px-1.5 py-1.5 font-medium text-[var(--ink)]"
            >
              {note}
            </div>
          ))}
          {hand.fingers.map((finger, i) => (
            <div
              key={`${hand.notes[i]}-${i}-finger`}
              className="bg-[var(--surface)] px-1.5 py-2 font-[family-name:var(--font-ui)] text-base font-semibold text-[var(--accent)]"
            >
              {finger}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScaleFingeringChart({
  fingering,
}: {
  fingering: FingeringDisplay;
}) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)]/40 px-3 py-3 text-sm">
      <div>
        <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--ink)]">
          Fingering — {fingering.key} major (one octave up)
        </p>
        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
          {fingering.note}
        </p>
      </div>
      <HandChart hand={fingering.rightHand} />
      <HandChart hand={fingering.leftHand} />
      <p className="text-xs text-[var(--ink-muted)]">
        Source:{" "}
        <a
          href={fingering.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          {fingering.source.title}
        </a>
        {fingering.source.note ? ` — ${fingering.source.note}` : null}
      </p>
    </div>
  );
}
