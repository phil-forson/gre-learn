import { getPresentPerfectExperienceUnit } from "@/features/grammar/seed/present-perfect-experience";
import { getPresentPerfectResultUnit } from "@/features/grammar/seed/present-perfect-result";
import { getFutureFormsUnit } from "@/features/grammar/seed/future-forms";
import { getModalsPermissionObligationUnit } from "@/features/grammar/seed/modals-permission-obligation";
import { getPastHabitsUnit } from "@/features/grammar/seed/past-habits";
import { getUsedToBeGetUsedToUnit } from "@/features/grammar/seed/used-to-be-get-used-to";
import { getPastAbilityUnit } from "@/features/grammar/seed/past-ability";
import { getPastPerfectUnit } from "@/features/grammar/seed/past-perfect";
import { getModalDeductionsPresentUnit } from "@/features/grammar/seed/modal-deductions-present";
import { getConditionalsZeroFirstSecondUnit } from "@/features/grammar/seed/conditionals-zero-first-second";
import { getContrastWordsUnit } from "@/features/grammar/seed/contrast-words";
import { getPhrasalVerbsUnit } from "@/features/grammar/seed/phrasal-verbs";
import { getFutureContinuousPerfectUnit } from "@/features/grammar/seed/future-continuous-perfect";
import { getModalDeductionsPastUnit } from "@/features/grammar/seed/modal-deductions-past";
import type {
  GrammarUnit,
  PublicGrammarUnit,
} from "@/features/grammar/types";
import { AppError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { getGrammarRepository } from "@/features/grammar/repository";

export const GRAMMAR_UNIT_IDS = [
  "present-perfect-experience",
  "present-perfect-result",
  "future-forms",
  "modals-permission-obligation",
  "past-habits",
  "used-to-be-get-used-to",
  "past-ability",
  "past-perfect",
  "modal-deductions-present",
  "conditionals-zero-first-second",
  "contrast-words",
  "phrasal-verbs",
  "future-continuous-perfect",
  "modal-deductions-past",
] as const;

export type GrammarUnitId = (typeof GRAMMAR_UNIT_IDS)[number];

const UNIT_LOADERS: Record<
  GrammarUnitId,
  () => Promise<GrammarUnit>
> = {
  "present-perfect-experience": getPresentPerfectExperienceUnit,
  "present-perfect-result": getPresentPerfectResultUnit,
  "future-forms": getFutureFormsUnit,
  "modals-permission-obligation": getModalsPermissionObligationUnit,
  "past-habits": getPastHabitsUnit,
  "used-to-be-get-used-to": getUsedToBeGetUsedToUnit,
  "past-ability": getPastAbilityUnit,
  "past-perfect": getPastPerfectUnit,
  "modal-deductions-present": getModalDeductionsPresentUnit,
  "conditionals-zero-first-second": getConditionalsZeroFirstSecondUnit,
  "contrast-words": getContrastWordsUnit,
  "phrasal-verbs": getPhrasalVerbsUnit,
  "future-continuous-perfect": getFutureContinuousPerfectUnit,
  "modal-deductions-past": getModalDeductionsPastUnit,
};

export async function listGrammarUnits(): Promise<GrammarUnit[]> {
  return Promise.all(GRAMMAR_UNIT_IDS.map((id) => UNIT_LOADERS[id]()));
}

export async function getGrammarUnitById(
  unitId: string,
): Promise<GrammarUnit | null> {
  const units = await listGrammarUnits();
  return (
    units.find((u) => u.id === unitId || u.slug === unitId) ?? null
  );
}

export async function requireGrammarUnit(unitId: string): Promise<GrammarUnit> {
  const unit = await getGrammarUnitById(unitId);
  if (!unit) {
    throw new AppError("Grammar unit not found.", "NOT_FOUND", 404);
  }
  return unit;
}

/** Strip correctChoiceId before sending units to the client. */
export function toPublicGrammarUnit(unit: GrammarUnit): PublicGrammarUnit {
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

export function toPublicGrammarUnits(
  units: GrammarUnit[],
): PublicGrammarUnit[] {
  return units.map(toPublicGrammarUnit);
}

export const GRAMMAR_CONTINUE_LABEL = "Continue grammar lesson";

/** Fallback href when progress cannot be resolved (first catalog unit). */
export const GRAMMAR_CONTINUE_FALLBACK_HREF = `/grammar/${GRAMMAR_UNIT_IDS[0]}`;

/**
 * Next incomplete unit in catalog order. Incomplete = missing progress or
 * status !== completed. Falls back to the first unit.
 */
export async function resolveGrammarContinueHref(): Promise<{
  href: string;
  label: string;
}> {
  const units = await listGrammarUnits();
  const first = units[0];
  if (!first) {
    return {
      href: GRAMMAR_CONTINUE_FALLBACK_HREF,
      label: GRAMMAR_CONTINUE_LABEL,
    };
  }

  try {
    const userId = getEnv().DEFAULT_USER_ID;
    const progressRows = await getGrammarRepository().listProgress(userId);
    const byUnit = new Map(progressRows.map((p) => [p.unitId, p]));
    const next =
      units.find((unit) => {
        const progress = byUnit.get(unit.id);
        return !progress || progress.status !== "completed";
      }) ?? first;
    return {
      href: `/grammar/${next.slug}`,
      label: GRAMMAR_CONTINUE_LABEL,
    };
  } catch {
    return {
      href: `/grammar/${first.slug}`,
      label: GRAMMAR_CONTINUE_LABEL,
    };
  }
}

/** @deprecated Prefer resolveGrammarContinueHref — kept as sync first-unit fallback. */
export const GRAMMAR_CONTINUE_HREF = GRAMMAR_CONTINUE_FALLBACK_HREF;
