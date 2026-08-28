import { getSentenceCombiningClarityUnit } from "@/features/sentence/seed/sentence-combining-clarity";
import { getConnectorsAdditiveContrastUnit } from "@/features/sentence/seed/connectors-additive-contrast";
import { getConnectorsCauseResultPurposeUnit } from "@/features/sentence/seed/connectors-cause-result-purpose";
import { getConcessionCounterflowUnit } from "@/features/sentence/seed/concession-counterflow";
import { getSentencePhrasalPackingUnit } from "@/features/sentence/seed/sentence-phrasal-packing";
import type {
  SentenceUnit,
  PublicSentenceUnit,
} from "@/features/sentence/types";
import { AppError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { getSentenceRepository } from "@/features/sentence/repository";
import { isMoreThanOneBandBelow } from "@/features/path/curriculum/cefr";
import type { CefrLevel } from "@/features/path/types";
import { getPathRepository } from "@/features/path/repository";

export const SENTENCE_UNIT_IDS = [
  "sentence-combining-clarity",
  "connectors-additive-contrast",
  "connectors-cause-result-purpose",
  "concession-counterflow",
  "sentence-phrasal-packing",
] as const;

export type SentenceUnitId = (typeof SENTENCE_UNIT_IDS)[number];

const UNIT_LOADERS: Record<SentenceUnitId, () => Promise<SentenceUnit>> = {
  "sentence-combining-clarity": getSentenceCombiningClarityUnit,
  "connectors-additive-contrast": getConnectorsAdditiveContrastUnit,
  "connectors-cause-result-purpose": getConnectorsCauseResultPurposeUnit,
  "concession-counterflow": getConcessionCounterflowUnit,
  "sentence-phrasal-packing": getSentencePhrasalPackingUnit,
};

export async function listSentenceUnits(): Promise<SentenceUnit[]> {
  return Promise.all(SENTENCE_UNIT_IDS.map((id) => UNIT_LOADERS[id]!()));
}

export async function getSentenceUnitById(
  unitId: string,
): Promise<SentenceUnit | null> {
  const units = await listSentenceUnits();
  return units.find((u) => u.id === unitId || u.slug === unitId) ?? null;
}

export async function requireSentenceUnit(
  unitId: string,
): Promise<SentenceUnit> {
  const unit = await getSentenceUnitById(unitId);
  if (!unit) {
    throw new AppError("Sentence unit not found.", "NOT_FOUND", 404);
  }
  return unit;
}

/** Strip correctChoiceId before sending units to the client. */
export function toPublicSentenceUnit(unit: SentenceUnit): PublicSentenceUnit {
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

export function toPublicSentenceUnits(
  units: SentenceUnit[],
): PublicSentenceUnit[] {
  return units.map(toPublicSentenceUnit);
}

export const SENTENCE_CONTINUE_LABEL = "Continue sentence lesson";

export const SENTENCE_CONTINUE_FALLBACK_HREF = `/sentence/${SENTENCE_UNIT_IDS[0]}`;

/**
 * Next incomplete sentence unit. Skips units more than one CEFR band below
 * the learner profile when a CEFR level is set.
 */
export async function resolveSentenceContinueHref(): Promise<{
  href: string;
  label: string;
}> {
  const units = await listSentenceUnits();
  const first = units[0];
  if (!first) {
    return {
      href: SENTENCE_CONTINUE_FALLBACK_HREF,
      label: SENTENCE_CONTINUE_LABEL,
    };
  }

  try {
    const userId = getEnv().DEFAULT_USER_ID;
    const profile = await getPathRepository().getOrCreateProfile(userId);
    const cefr: CefrLevel | null = profile.cefrLevel;
    const eligible =
      cefr == null
        ? units
        : units.filter((unit) => !isMoreThanOneBandBelow(unit.cefrBand, cefr));
    const pool = eligible.length > 0 ? eligible : units;

    const progressRows = await getSentenceRepository().listProgress(userId);
    const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
    const next =
      pool.find((unit) => {
        const progress = byUnit.get(unit.id);
        return !progress || progress.status !== "completed";
      }) ?? pool[0]!;
    return {
      href: `/sentence/${next.slug}`,
      label: SENTENCE_CONTINUE_LABEL,
    };
  } catch {
    return {
      href: `/sentence/${first.slug}`,
      label: SENTENCE_CONTINUE_LABEL,
    };
  }
}

export const SENTENCE_CONTINUE_HREF = SENTENCE_CONTINUE_FALLBACK_HREF;
