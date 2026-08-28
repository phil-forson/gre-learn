import { getSpokenShortTurnsUnit } from "@/features/speaking/seed/spoken-short-turns";
import { getSpokenNarrativeFramesUnit } from "@/features/speaking/seed/spoken-narrative-frames";
import { getSpokenOpinionFramesUnit } from "@/features/speaking/seed/spoken-opinion-frames";
import { getSpokenSequencingConnectorsUnit } from "@/features/speaking/seed/spoken-sequencing-connectors";
import { getSpokenPhrasalClustersUnit } from "@/features/speaking/seed/spoken-phrasal-clusters";
import type {
  SpeakingUnit,
  PublicSpeakingUnit,
} from "@/features/speaking/types";
import { AppError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { getSpeakingRepository } from "@/features/speaking/repository";

export const SPEAKING_UNIT_IDS = [
  "spoken-short-turns",
  "spoken-narrative-frames",
  "spoken-opinion-frames",
  "spoken-sequencing-connectors",
  "spoken-phrasal-clusters",
] as const;

export type SpeakingUnitId = (typeof SPEAKING_UNIT_IDS)[number];

const UNIT_LOADERS: Record<SpeakingUnitId, () => Promise<SpeakingUnit>> = {
  "spoken-short-turns": getSpokenShortTurnsUnit,
  "spoken-narrative-frames": getSpokenNarrativeFramesUnit,
  "spoken-opinion-frames": getSpokenOpinionFramesUnit,
  "spoken-sequencing-connectors": getSpokenSequencingConnectorsUnit,
  "spoken-phrasal-clusters": getSpokenPhrasalClustersUnit,
};

export async function listSpeakingUnits(): Promise<SpeakingUnit[]> {
  return Promise.all(SPEAKING_UNIT_IDS.map((id) => UNIT_LOADERS[id]!()));
}

export async function getSpeakingUnitById(
  unitId: string,
): Promise<SpeakingUnit | null> {
  const units = await listSpeakingUnits();
  return units.find((u) => u.id === unitId || u.slug === unitId) ?? null;
}

export async function requireSpeakingUnit(
  unitId: string,
): Promise<SpeakingUnit> {
  const unit = await getSpeakingUnitById(unitId);
  if (!unit) {
    throw new AppError("Speaking unit not found.", "NOT_FOUND", 404);
  }
  return unit;
}

/** Strip correctChoiceId before sending units to the client. */
export function toPublicSpeakingUnit(unit: SpeakingUnit): PublicSpeakingUnit {
  const { knowledgeTest, ...rest } = unit;
  return {
    ...rest,
    microTask: {
      id: unit.microTask.id,
      prompt: unit.microTask.prompt,
      items: unit.microTask.items.map(
        ({ correctChoiceId: _hidden, ...item }) => item,
      ),
    },
    ...(knowledgeTest
      ? {
          knowledgeTest: {
            id: knowledgeTest.id,
            title: knowledgeTest.title,
            prompt: knowledgeTest.prompt,
            items: knowledgeTest.items.map(
              ({ correctChoiceId: _hidden, ...item }) => item,
            ),
          },
        }
      : {}),
  };
}

export function toPublicSpeakingUnits(
  units: SpeakingUnit[],
): PublicSpeakingUnit[] {
  return units.map(toPublicSpeakingUnit);
}

export const SPEAKING_CONTINUE_LABEL = "Continue speaking lesson";

export const SPEAKING_CONTINUE_FALLBACK_HREF = `/speaking/${SPEAKING_UNIT_IDS[0]}`;

/**
 * Next incomplete speaking unit in catalog order.
 * Does NOT skip A2–B1 oral basics based on a higher CEFR profile.
 */
export async function resolveSpeakingContinueHref(): Promise<{
  href: string;
  label: string;
}> {
  const units = await listSpeakingUnits();
  const first = units[0];
  if (!first) {
    return {
      href: SPEAKING_CONTINUE_FALLBACK_HREF,
      label: SPEAKING_CONTINUE_LABEL,
    };
  }

  try {
    const userId = getEnv().DEFAULT_USER_ID;
    const progressRows = await getSpeakingRepository().listProgress(userId);
    const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
    const next =
      units.find((unit) => {
        const progress = byUnit.get(unit.id);
        return !progress || progress.status !== "completed";
      }) ?? first;
    return {
      href: `/speaking/${next.slug}`,
      label: SPEAKING_CONTINUE_LABEL,
    };
  } catch {
    return {
      href: `/speaking/${first.slug}`,
      label: SPEAKING_CONTINUE_LABEL,
    };
  }
}

export const SPEAKING_CONTINUE_HREF = SPEAKING_CONTINUE_FALLBACK_HREF;
