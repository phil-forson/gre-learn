import Link from "next/link";
import { getOrCreatePianoProfile } from "@/features/piano/services/profile-service";
import { getTodayPlan } from "@/features/piano/services/today-service";
import { getPhase } from "@/features/piano/catalog";

export const dynamic = "force-dynamic";

export default async function PianoHomePage() {
  const [profile, plan] = await Promise.all([
    getOrCreatePianoProfile(),
    getTodayPlan(),
  ]);
  const phase = getPhase(profile.activePhaseIndex);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Piano path
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)]">
          Fixed 60-minute days — gospel-weighted practice with jazz and classical
          technique. No noodling past the blocks.
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Active phase
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
            {phase?.title ?? `Phase ${profile.activePhaseIndex + 1}`}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Today {plan.completedMinutes}/{plan.totalMinutes} min · mix 60%
            gospel / 25% jazz / 15% classical
          </p>
        </div>
        <Link
          href="/piano/today"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
        >
          Practice today
        </Link>
      </section>

      <section className="flex flex-wrap gap-4">
        <Link
          href="/piano/roadmap"
          className="font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          Skill roadmap
        </Link>
        <Link
          href="/piano/notes"
          className="font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
        >
          YouTube notes
        </Link>
      </section>
    </div>
  );
}
