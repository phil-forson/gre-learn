import { getSkill } from "@/features/piano/catalog";
import {
  buildReferencePack,
  type GroundedAskContext,
} from "@/features/learning/services/grounded-ask-ai";
import { AppError } from "@/lib/errors";
import { buildBlockLessonDetail, pickFocusKey } from "./lesson-detail";
import { getSkillProgressMap } from "./skill-service";

export async function buildPianoLessonAskContext(
  skillId: string,
  localDay: string,
): Promise<GroundedAskContext> {
  const skill = getSkill(skillId);
  if (!skill) {
    throw new AppError("Skill not found", "NOT_FOUND", 404);
  }

  const progressMap = await getSkillProgressMap();
  const keysCompleted = progressMap.get(skillId)?.keysCompleted ?? [];
  const focusKey = pickFocusKey(localDay, keysCompleted);
  const detail = buildBlockLessonDetail(skill, focusKey, keysCompleted);

  const fingeringNote =
    detail.fingering ?
      [
        `Key: ${detail.fingering.key} major`,
        `RH pattern: ${detail.fingering.rightHand.pattern}`,
        `LH pattern: ${detail.fingering.leftHand.pattern}`,
        `Source: ${detail.fingering.source.title} (${detail.fingering.source.url})`,
      ].join("\n")
    : undefined;

  const tempoNote =
    detail.tempo ?
      `Start ${detail.tempo.startBpm} BPM → target ${detail.tempo.targetBpm} BPM (${detail.tempo.noteValue}). ${detail.tempo.howToUse}`
    : undefined;

  return {
    title: skill.title,
    exercise: detail.exercise,
    referencePack: buildReferencePack({
      Why: detail.why,
      Steps: detail.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
      "Pass when": detail.passRule,
      Tip: detail.tip,
      Tempo: tempoNote,
      Fingering: fingeringNote,
      "Focus key": detail.trackKeys ? `${focusKey} major` : undefined,
    }),
    sources: detail.sources,
    glossary: detail.glossary,
  };
}
