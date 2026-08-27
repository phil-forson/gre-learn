"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WordGroup } from "@/features/vocabulary/types";

type Props = {
  vocabularyId: string;
  groupId: string | null;
  groups: WordGroup[];
  compact?: boolean;
};

export function GroupAssignSelect({
  vocabularyId,
  groupId,
  groups,
  compact = false,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(groupId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    setValue(next);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/vocabulary/${vocabularyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_group",
          groupId: next || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Assign failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assign failed");
      setValue(groupId ?? "");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={compact ? "inline-flex items-center gap-2" : "space-y-1"}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!compact ? (
        <label
          htmlFor={`group-${vocabularyId}`}
          className="block font-[family-name:var(--font-ui)] text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]"
        >
          Study group
        </label>
      ) : null}
      <select
        id={`group-${vocabularyId}`}
        value={value}
        disabled={busy}
        onChange={(e) => void onChange(e.target.value)}
        className={`rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] disabled:opacity-60 ${
          compact
            ? "min-h-9 px-2 text-xs"
            : "min-h-11 w-full px-3 text-sm"
        }`}
        aria-label="Assign study group"
      >
        <option value="">No group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
