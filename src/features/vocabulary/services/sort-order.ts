import type { WordGroup } from "@/features/vocabulary/types";

export function compareSortOrder(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function sortWordGroups(groups: WordGroup[]): WordGroup[] {
  return [...groups].sort((a, b) => compareSortOrder(a.sortOrder, b.sortOrder));
}

export function nextSortOrder(groups: WordGroup[]): string {
  if (!groups.length) return "1";
  const sorted = sortWordGroups(groups);
  const last = sorted[sorted.length - 1]!.sortOrder;
  const num = Number.parseInt(last, 10);
  if (!Number.isNaN(num)) return String(num + 1);
  return `${last}-1`;
}

export function sortOrdersForReorder(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String(i + 1));
}
