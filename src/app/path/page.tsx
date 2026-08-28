import Link from "next/link";
import { CEFR_LABELS, SKIP_DEFAULT_CEFR } from "@/features/path/catalog";
import { getContinueWithProfile } from "@/features/path/services/continue-service";
import { listTracksWithProfile } from "@/features/path/services/placement-service";

export const dynamic = "force-dynamic";

export default async function PathHomePage() {
  const [{ profile, tracks }, { continueTarget }] = await Promise.all([
    listTracksWithProfile(),
    getContinueWithProfile(),
  ]);

  const levelLabel = profile.cefrLevel
    ? CEFR_LABELS[profile.cefrLevel]
    : "Not set yet";

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Learning path
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)]">
          American English tracks with a CEFR level so you always know where to
          continue.
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
            Your level
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
            {levelLabel}
          </p>
          {profile.placementStatus === "skipped" ? (
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Placement skipped — defaulted to {SKIP_DEFAULT_CEFR}. You can
              retake anytime.
            </p>
          ) : null}
          {profile.placementStatus === "not_started" ? (
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Take a short placement to set your starting level.
            </p>
          ) : null}
        </div>
        <Link
          href={continueTarget.href}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
        >
          {continueTarget.label}
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Skill tracks
        </h2>
        <ul className="space-y-3">
          {tracks.map((track) => (
            <li key={track.id}>
              <Link
                href={track.href}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 transition-colors hover:bg-[var(--overlay)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-ui)] text-base font-semibold text-[var(--ink)]">
                      {track.label}
                      {track.isActive ? (
                        <span className="ml-2 text-xs font-medium text-[var(--accent)]">
                          Active
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">
                      {track.description}
                    </p>
                  </div>
                  <span className="shrink-0 font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    {track.status === "live" ? "Live" : "Soon"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {profile.placementStatus !== "not_started" ? (
        <p className="text-sm text-[var(--ink-muted)]">
          <Link href="/path/placement" className="text-[var(--accent)]">
            Retake placement
          </Link>
        </p>
      ) : null}
    </div>
  );
}
