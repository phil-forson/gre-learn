import { CEFR_LEVELS } from "@/features/path/types";
import type {
  CefrLevel,
  PlacementAnswer,
  PlacementResult,
} from "@/features/path/types";
import {
  emptyScoresByBand,
  getPlacementBank,
  getPlacementItemById,
} from "./bank";
import { nowIso } from "@/lib/utils";
import { AppError } from "@/lib/errors";

/**
 * Rules-based scorer: accuracy + highest band with solid coverage.
 * Stable for fixtures — no randomness, no OpenAI.
 */
export function scorePlacement(answers: PlacementAnswer[]): PlacementResult {
  if (answers.length === 0) {
    throw new AppError("At least one answer is required", "VALIDATION_ERROR", 400);
  }

  const bank = getPlacementBank();
  const seen = new Set<string>();
  const scoresByBand = emptyScoresByBand();

  // Count totals from bank bands that appear in answers (or all bank items answered)
  const answeredIds = new Set(answers.map((a) => a.itemId));

  for (const item of bank) {
    if (!answeredIds.has(item.id)) continue;
    scoresByBand[item.band].total += 1;
  }

  let correctCount = 0;

  for (const answer of answers) {
    if (seen.has(answer.itemId)) {
      throw new AppError(
        `Duplicate answer for item ${answer.itemId}`,
        "VALIDATION_ERROR",
        400,
      );
    }
    seen.add(answer.itemId);

    const item = getPlacementItemById(answer.itemId);
    if (!item) {
      throw new AppError(
        `Unknown placement item: ${answer.itemId}`,
        "VALIDATION_ERROR",
        400,
      );
    }

    const validChoice = item.choices.some((c) => c.id === answer.choiceId);
    if (!validChoice) {
      throw new AppError(
        `Invalid choice for item ${answer.itemId}`,
        "VALIDATION_ERROR",
        400,
      );
    }

    if (answer.choiceId === item.correctChoiceId) {
      correctCount += 1;
      scoresByBand[item.band].correct += 1;
    }
  }

  const itemCount = answers.length;
  const recommendedLevel = recommendLevel(scoresByBand, correctCount, itemCount);

  return {
    recommendedLevel,
    correctCount,
    itemCount,
    scoresByBand,
    method: "rules",
    skippedUnitIds: [],
    answeredAt: nowIso(),
  };
}

function bandAccuracy(band: CefrLevel, scores: PlacementResult["scoresByBand"]): number | null {
  const s = scores[band];
  if (s.total === 0) return null;
  return s.correct / s.total;
}

/**
 * Walk bands low→high; assign the highest band where accuracy ≥ 0.6
 * and at least one item was answered in that band (or below).
 * Fall back by overall accuracy thresholds.
 */
function recommendLevel(
  scoresByBand: PlacementResult["scoresByBand"],
  correctCount: number,
  itemCount: number,
): CefrLevel {
  const overall = itemCount > 0 ? correctCount / itemCount : 0;

  let recommended: CefrLevel = "A1";

  for (const band of CEFR_LEVELS) {
    const acc = bandAccuracy(band, scoresByBand);
    if (acc === null) continue;
    if (acc >= 0.6) {
      recommended = band;
    } else {
      // First failing band stops upward climb
      break;
    }
  }

  // Overall accuracy floors / ceilings as soft guardrails
  if (overall < 0.35 && recommended !== "A1") {
    return "A1";
  }
  if (overall >= 0.9 && (recommended === "A1" || recommended === "A2")) {
    // Strong overall but weak early band data — nudge toward B1 floor
    const b1 = bandAccuracy("B1", scoresByBand);
    if (b1 !== null && b1 >= 0.5) return "B1";
  }
  if (overall >= 0.85) {
    const c1 = bandAccuracy("C1", scoresByBand);
    if (c1 !== null && c1 >= 0.66) return "C1";
    const b2 = bandAccuracy("B2", scoresByBand);
    if (b2 !== null && b2 >= 0.66 && CEFR_LEVELS.indexOf(recommended) < CEFR_LEVELS.indexOf("B2")) {
      return "B2";
    }
  }

  return recommended;
}
