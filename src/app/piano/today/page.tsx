import Link from "next/link";
import { TodayChecklist } from "@/features/piano/components/TodayChecklist";
import { getTodayPlan } from "@/features/piano/services/today-service";

export const dynamic = "force-dynamic";

export default async function PianoTodayPage() {
  const plan = await getTodayPlan();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="font-[family-name:var(--font-ui)] text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          <Link href="/piano" className="hover:text-[var(--ink)]">
            Piano
          </Link>{" "}
          · {plan.localDay}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Today&apos;s 60
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)]">
          {plan.phase?.title ?? "Active phase"} — work through each lesson, then
          mark the key or block done. No abbreviations without explanation
          below each block.
        </p>
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--accent)]">
          {plan.completedMinutes} / {plan.totalMinutes} minutes logged
        </p>
        {plan.keysOverview.total > 0 ? (
          <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)]">
            Major keys (tracked): {plan.keysOverview.completed.length} /{" "}
            {plan.keysOverview.total} done
            {plan.keysOverview.remaining.length > 0
              ? ` · Next up: ${plan.keysOverview.remaining.slice(0, 3).join(", ")}`
              : " · All 12 keys complete — maintenance mode"}
          </p>
        ) : null}
      </section>

      <TodayChecklist
        blocks={plan.blocks.map((b) => ({
          id: b.id,
          label: b.label,
          minutes: b.minutes,
          description: b.description,
          completed: b.completed,
          skillId: b.skill.id,
          skillTitle: b.skill.title,
          detail: b.detail,
        }))}
        localDay={plan.localDay}
      />

      {plan.notePrompts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            From your notes
          </h2>
          <ul className="space-y-2">
            {plan.notePrompts.map((n) => (
              <li
                key={n.noteId}
                className="rounded-xl border border-dashed border-[var(--line)] px-4 py-3"
              >
                <p className="text-sm text-[var(--ink)]">{n.summary}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ink-muted)]">
                  {n.prompts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
