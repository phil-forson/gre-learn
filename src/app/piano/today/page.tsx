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
          {plan.phase?.title ?? "Active phase"} — complete each block in order.
          Timer discipline beats noodling.
        </p>
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--accent)]">
          {plan.completedMinutes} / {plan.totalMinutes} minutes logged
        </p>
      </section>

      <TodayChecklist blocks={plan.blocks} localDay={plan.localDay} />

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Suggested skills
        </h2>
        <ul className="space-y-2">
          {plan.suggestedSkills.map((skill) => (
            <li
              key={skill.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3"
            >
              <p className="font-[family-name:var(--font-ui)] text-sm font-semibold">
                {skill.title}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {skill.practicePrompt}
              </p>
            </li>
          ))}
        </ul>
      </section>

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
