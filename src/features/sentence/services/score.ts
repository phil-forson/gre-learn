import type {
  SentenceKnowledgeTestAnswer,
  SentenceKnowledgeTestScore,
  SentenceMicroTaskAnswer,
  SentenceMicroTaskScore,
  SentenceUnit,
} from "@/features/sentence/types";
import { AppError } from "@/lib/errors";

export function scoreSentenceMicroTask(
  unit: SentenceUnit,
  answers: SentenceMicroTaskAnswer[],
): SentenceMicroTaskScore {
  const byItem = new Map(answers.map((a) => [a.itemId, a.choiceId]));
  const itemResults = unit.microTask.items.map((item) => {
    const choiceId = byItem.get(item.id);
    if (!choiceId) {
      throw new AppError(
        `Missing answer for item ${item.id}`,
        "VALIDATION_ERROR",
        400,
      );
    }
    return {
      itemId: item.id,
      correct: choiceId === item.correctChoiceId,
      correctChoiceId: item.correctChoiceId,
    };
  });

  if (byItem.size !== unit.microTask.items.length) {
    throw new AppError(
      "Answer every micro-task item once.",
      "VALIDATION_ERROR",
      400,
    );
  }

  const correctCount = itemResults.filter((r) => r.correct).length;
  const itemCount = itemResults.length;
  return {
    correctCount,
    itemCount,
    passed: correctCount === itemCount,
    itemResults,
  };
}

/** Pass threshold: ceil(80% of item count). */
export function knowledgeTestPassThreshold(itemCount: number): number {
  return Math.ceil(itemCount * 0.8);
}

export function scoreSentenceKnowledgeTest(
  unit: SentenceUnit,
  answers: SentenceKnowledgeTestAnswer[],
): SentenceKnowledgeTestScore {
  const test = unit.knowledgeTest;
  if (!test) {
    throw new AppError(
      "This unit has no knowledge test.",
      "NOT_FOUND",
      404,
    );
  }

  const byItem = new Map(answers.map((a) => [a.itemId, a.choiceId]));
  const itemResults = test.items.map((item) => {
    const choiceId = byItem.get(item.id);
    if (!choiceId) {
      throw new AppError(
        `Missing answer for item ${item.id}`,
        "VALIDATION_ERROR",
        400,
      );
    }
    return {
      itemId: item.id,
      correct: choiceId === item.correctChoiceId,
      correctChoiceId: item.correctChoiceId,
    };
  });

  if (byItem.size !== test.items.length) {
    throw new AppError(
      "Answer every knowledge-test item once.",
      "VALIDATION_ERROR",
      400,
    );
  }

  const correctCount = itemResults.filter((r) => r.correct).length;
  const itemCount = itemResults.length;
  const passThreshold = knowledgeTestPassThreshold(itemCount);
  return {
    correctCount,
    itemCount,
    passThreshold,
    passed: correctCount >= passThreshold,
    itemResults,
  };
}
