import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { nextSortOrder } from "@/features/vocabulary/services/sort-order";
import type { WordGroup } from "@/features/vocabulary/types";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export async function listWordGroups(): Promise<WordGroup[]> {
  return getVocabularyRepository().listWordGroups(getUserId());
}

export async function createWordGroup(name: string): Promise<WordGroup> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.listWordGroups(userId);
  const now = nowIso();
  const group: WordGroup = {
    id: createId("group"),
    userId,
    name: name.trim(),
    sortOrder: nextSortOrder(existing),
    dateCreated: now,
    dateUpdated: now,
  };
  return repo.createWordGroup(group);
}

export async function renameWordGroup(
  id: string,
  name: string,
): Promise<WordGroup> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getWordGroup(userId, id);
  if (!existing) throw new AppError("Group not found.", "NOT_FOUND", 404);
  return repo.updateWordGroup(userId, id, {
    name: name.trim(),
    dateUpdated: nowIso(),
  });
}

export async function deleteWordGroup(id: string): Promise<void> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getWordGroup(userId, id);
  if (!existing) throw new AppError("Group not found.", "NOT_FOUND", 404);
  await repo.deleteWordGroup(userId, id);
}

export async function reorderWordGroups(
  orderedIds: string[],
): Promise<WordGroup[]> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  try {
    return await repo.reorderWordGroups(userId, orderedIds);
  } catch {
    throw new AppError("Invalid group order.", "INVALID_ORDER", 400);
  }
}

export async function assignWordToGroup(
  vocabularyId: string,
  groupId: string | null,
): Promise<void> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  try {
    await repo.assignWordToGroup(userId, vocabularyId, groupId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assign failed";
    if (message.includes("not found")) {
      throw new AppError(message, "NOT_FOUND", 404);
    }
    throw new AppError(message, "ASSIGN_FAILED", 400);
  }
}

export function getNextGroupId(
  groups: WordGroup[],
  currentGroupId: string | null,
): string | null {
  if (!groups.length) return null;
  if (!currentGroupId) return groups[0]?.id ?? null;
  const index = groups.findIndex((g) => g.id === currentGroupId);
  if (index === -1) return groups[0]?.id ?? null;
  return groups[index + 1]?.id ?? null;
}
