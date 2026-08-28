import Link from "next/link";
import { PracticeSkillButton } from "@/features/piano/components/PracticeSkillButton";
import { getRoadmap } from "@/features/piano/services/skill-service";

export const dynamic = "force-dynamic";

export default async function PianoRoadmapPage() {
  const roadmap = await getRoadmap();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="font-[family-name:var(--font-ui)] text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-muted)]">
          <Link href="/piano" className="hover:text-[var(--ink)]">
            Piano
          </Link>
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Skill roadmap
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)]">
          {roadmap.catalogSkillCount} skills across {roadmap.domains.length}{" "}
          domains. Early basics stay on the tree as light revision.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Phases
        </h2>
        <ul className="space-y-2">
          {roadmap.phases.map((phase) => (
            <li
              key={phase.phaseIndex}
              className={`rounded-xl border px-4 py-3 ${
                phase.phaseIndex === roadmap.profile.activePhaseIndex
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              }`}
            >
              <p className="font-[family-name:var(--font-ui)] text-sm font-semibold">
                {phase.title}
                {phase.phaseIndex === roadmap.profile.activePhaseIndex ? (
                  <span className="ml-2 text-xs text-[var(--accent)]">
                    Active
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {phase.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {roadmap.domains.map((domain) => {
        const skills = roadmap.skills.filter((s) => s.domainId === domain.id);
        return (
          <section key={domain.id} className="space-y-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                {domain.index}. {domain.title}
              </h2>
              <p className="text-sm text-[var(--ink-muted)]">
                {domain.description}
              </p>
            </div>
            <ul className="space-y-2">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-[family-name:var(--font-ui)] text-sm font-semibold">
                      {skill.title}
                      <span className="ml-2 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
                        {skill.status} · {skill.strand}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">
                      {skill.description}
                    </p>
                  </div>
                  {skill.status !== "mastered" ? (
                    <PracticeSkillButton skillId={skill.id} />
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
