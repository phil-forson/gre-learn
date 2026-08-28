import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSkillTrack, isSkillTrackId } from "@/features/path/catalog";
import { resolveContinueTarget } from "@/features/path/services/continue-service";
import {
  GRAMMAR_CONTINUE_HREF,
  listGrammarUnits,
  toPublicGrammarUnit,
} from "@/features/grammar/catalog";
import { GrammarCompletedBadge } from "@/features/grammar/components/GrammarCompletedBadge";
import { getGrammarRepository } from "@/features/grammar/repository";
import {
  SENTENCE_CONTINUE_HREF,
  listSentenceUnits,
  toPublicSentenceUnit,
} from "@/features/sentence/catalog";
import { SentenceCompletedBadge } from "@/features/sentence/components/SentenceCompletedBadge";
import { getSentenceRepository } from "@/features/sentence/repository";
import {
  SPEAKING_CONTINUE_HREF,
  listSpeakingUnits,
  toPublicSpeakingUnit,
} from "@/features/speaking/catalog";
import { SpeakingCompletedBadge } from "@/features/speaking/components/SpeakingCompletedBadge";
import { getSpeakingRepository } from "@/features/speaking/repository";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ trackId: string }>;
};

type UnitListItem = {
  id: string;
  slug: string;
  title: string;
  cefrBand: string;
  href: string;
  completed: boolean;
  statusLabel: string;
};

async function loadGrammarUnits(): Promise<{
  units: UnitListItem[];
  lessonHref: string;
  continueLabel: string;
  Badge: typeof GrammarCompletedBadge;
}> {
  const units = await listGrammarUnits();
  const userId = getEnv().DEFAULT_USER_ID;
  const progressRows = await getGrammarRepository().listProgress(userId);
  const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
  const continueTarget = await resolveContinueTarget();
  const lessonHref =
    continueTarget.trackId === "grammar" && !continueTarget.needsPlacement
      ? continueTarget.href
      : GRAMMAR_CONTINUE_HREF;

  return {
    lessonHref,
    continueLabel: "Continue grammar lesson",
    Badge: GrammarCompletedBadge,
    units: units.map((unit) => {
      const publicUnit = toPublicGrammarUnit(unit);
      const progress = byUnit.get(unit.id);
      const completed = progress?.status === "completed";
      return {
        id: unit.id,
        slug: publicUnit.slug,
        title: publicUnit.title,
        cefrBand: publicUnit.cefrBand,
        href: `/grammar/${unit.slug}`,
        completed,
        statusLabel: progress
          ? `Status: ${progress.status.replace("_", " ")}`
          : "Not started",
      };
    }),
  };
}

async function loadSentenceUnits(): Promise<{
  units: UnitListItem[];
  lessonHref: string;
  continueLabel: string;
  Badge: typeof SentenceCompletedBadge;
}> {
  const units = await listSentenceUnits();
  const userId = getEnv().DEFAULT_USER_ID;
  const progressRows = await getSentenceRepository().listProgress(userId);
  const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
  const continueTarget = await resolveContinueTarget();
  const lessonHref =
    continueTarget.trackId === "sentence" && !continueTarget.needsPlacement
      ? continueTarget.href
      : SENTENCE_CONTINUE_HREF;

  return {
    lessonHref,
    continueLabel: "Continue sentence lesson",
    Badge: SentenceCompletedBadge,
    units: units.map((unit) => {
      const publicUnit = toPublicSentenceUnit(unit);
      const progress = byUnit.get(unit.id);
      const completed = progress?.status === "completed";
      return {
        id: unit.id,
        slug: publicUnit.slug,
        title: publicUnit.title,
        cefrBand: publicUnit.cefrBand,
        href: `/sentence/${unit.slug}`,
        completed,
        statusLabel: progress
          ? `Status: ${progress.status.replace("_", " ")}`
          : "Not started",
      };
    }),
  };
}

async function loadSpeakingUnits(): Promise<{
  units: UnitListItem[];
  lessonHref: string;
  continueLabel: string;
  Badge: typeof SpeakingCompletedBadge;
}> {
  const units = await listSpeakingUnits();
  const userId = getEnv().DEFAULT_USER_ID;
  const progressRows = await getSpeakingRepository().listProgress(userId);
  const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
  const continueTarget = await resolveContinueTarget();
  const lessonHref =
    continueTarget.trackId === "speaking" && !continueTarget.needsPlacement
      ? continueTarget.href
      : SPEAKING_CONTINUE_HREF;

  return {
    lessonHref,
    continueLabel: "Continue speaking lesson",
    Badge: SpeakingCompletedBadge,
    units: units.map((unit) => {
      const publicUnit = toPublicSpeakingUnit(unit);
      const progress = byUnit.get(unit.id);
      const completed = progress?.status === "completed";
      return {
        id: unit.id,
        slug: publicUnit.slug,
        title: publicUnit.title,
        cefrBand: publicUnit.cefrBand,
        href: `/speaking/${unit.slug}`,
        completed,
        statusLabel: progress
          ? `Status: ${progress.status.replace("_", " ")}`
          : "Not started",
      };
    }),
  };
}

export default async function TrackPage({ params }: Props) {
  const { trackId } = await params;

  if (trackId === "vocabulary") {
    redirect("/path");
  }

  if (!isSkillTrackId(trackId)) notFound();

  const track = getSkillTrack(trackId);
  if (!track) notFound();

  if (track.status === "live") {
    const loaded =
      track.id === "grammar"
        ? await loadGrammarUnits()
        : track.id === "sentence"
          ? await loadSentenceUnits()
          : track.id === "speaking"
            ? await loadSpeakingUnits()
            : null;

    if (loaded) {
      const { units, lessonHref, continueLabel, Badge } = loaded;
      return (
        <div className="space-y-6">
          <div>
            <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Live track
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              {track.label}
            </h1>
            <p className="mt-2 max-w-lg text-[var(--ink-muted)]">
              {track.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={lessonHref}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
            >
              {continueLabel}
            </Link>
            <Link
              href="/path"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 font-[family-name:var(--font-ui)] text-sm font-medium"
            >
              Back to path
            </Link>
          </div>

          <ul className="space-y-3">
            {units.map((unit) => (
              <li key={unit.id}>
                <Link
                  href={unit.href}
                  className={`block rounded-xl border px-4 py-3 transition-colors ${
                    unit.completed
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] hover:border-[var(--accent)]"
                      : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                        {unit.cefrBand}
                      </p>
                      <p
                        className={`mt-1 font-[family-name:var(--font-display)] text-lg font-semibold ${
                          unit.completed ? "text-[var(--accent)]" : ""
                        }`}
                      >
                        {unit.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink-muted)]">
                        {unit.statusLabel}
                      </p>
                    </div>
                    <Badge completed={unit.completed} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Coming in a later phase
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          {track.label}
        </h1>
        <p className="mt-2 max-w-lg text-[var(--ink-muted)]">
          {track.description} Grammar stays available meanwhile.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/path/tracks/grammar"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
        >
          Continue grammar
        </Link>
        <Link
          href="/path"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line)] px-5 font-[family-name:var(--font-ui)] text-sm font-medium"
        >
          Back to path
        </Link>
      </div>
    </div>
  );
}
