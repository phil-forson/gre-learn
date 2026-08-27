import Link from "next/link";
import { AddWordForm } from "@/features/vocabulary/components/AddWordForm";
import { BatchAddForm } from "@/features/vocabulary/components/BatchAddForm";
import { ManualAddForm } from "@/features/vocabulary/components/ManualAddForm";
import { WordListItem } from "@/features/vocabulary/components/WordListItem";
import { getDashboardData } from "@/features/vocabulary/services/vocabulary-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { stats, recent } = await getDashboardData();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Your personal GRE vocabulary podcast
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)]">
          Add words as you study. Later, press play once and listen through meaning,
          roots, memory hooks, and examples — hands-free.
        </p>
      </section>

      <AddWordForm />

      <section className="rounded-2xl border border-dashed border-[var(--line)] p-4">
        <ManualAddForm />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/audio"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
        >
          Start audio review
        </Link>
        <Link
          href="/library"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--ink)]"
        >
          Browse library
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Words saved", value: stats.total },
          { label: "This week", value: stats.addedThisWeek },
          { label: "Reviewed today", value: stats.reviewedToday },
          { label: "Favorites", value: stats.favorites },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3"
          >
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              {stat.value}
            </p>
            <p className="mt-1 font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Recent
          </h2>
          <Link
            href="/library"
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--accent)]"
          >
            View all
          </Link>
        </div>
        {recent.length ? (
          <ul className="space-y-3">
            {recent.map((entry) => (
              <WordListItem key={entry.id} entry={entry} />
            ))}
          </ul>
        ) : (
          <p className="text-[var(--ink-muted)]">
            No words yet. Add your first GRE word above to get started.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--line)] p-4">
        <BatchAddForm />
      </section>
    </div>
  );
}
