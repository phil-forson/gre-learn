"use client";

import { useState } from "react";
import type { WordGroup } from "@/features/vocabulary/types";

type Props = {
  id: string;
  label?: string;
  groups: WordGroup[];
  groupId: string;
  onGroupIdChange: (groupId: string) => void;
  onGroupsChange: (groups: WordGroup[]) => void;
  disabled?: boolean;
};

/**
 * Select an existing study group or create one inline.
 * Always visible — even when the user has zero groups yet.
 */
export function GroupPickOrCreate({
  id,
  label = "Assign to group (optional)",
  groups,
  groupId,
  onGroupIdChange,
  onGroupsChange,
  disabled = false,
}: Props) {
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createGroup() {
    if (!newName.trim() || busy || disabled) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/word-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Create failed");
      const created = data.group as WordGroup;
      onGroupsChange(
        [...groups, created].sort((a, b) => a.sortOrder.localeCompare(b.sortOrder)),
      );
      onGroupIdChange(created.id);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="mb-1 block font-[family-name:var(--font-ui)] text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]"
      >
        {label}
      </label>
      <select
        id={id}
        value={groupId}
        disabled={disabled || busy}
        onChange={(e) => onGroupIdChange(e.target.value)}
        className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] sm:max-w-xs"
      >
        <option value="">No group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2 sm:max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={disabled || busy}
          placeholder="Or create a new group…"
          className="min-h-11 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)]"
          aria-label="New group name"
        />
        <button
          type="button"
          disabled={disabled || busy || !newName.trim()}
          onClick={() => void createGroup()}
          className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create group"}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
