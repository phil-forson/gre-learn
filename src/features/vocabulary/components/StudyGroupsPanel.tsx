"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { WordGroup } from "@/features/vocabulary/types";

type Props = {
  groups: WordGroup[];
  activeGroupId: string;
};

export function StudyGroupsPanel({ groups: initial, activeGroupId }: Props) {
  const router = useRouter();
  const [groups, setGroups] = useState(initial);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectGroup(groupId: string) {
    const params = new URLSearchParams(window.location.search);
    if (groupId === "all") params.delete("groupId");
    else params.set("groupId", groupId);
    params.delete("page");
    router.push(`/library?${params.toString()}`);
  }

  async function refreshGroups() {
    const response = await fetch("/api/word-groups");
    const data = await response.json();
    if (response.ok) setGroups(data.groups);
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/word-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Create failed");
      setName("");
      await refreshGroups();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveRename(id: string) {
    if (!editName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/word-groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Rename failed");
      setEditingId(null);
      await refreshGroups();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rename failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeGroup(id: string, groupName: string) {
    if (!confirm(`Delete “${groupName}”? Words stay in your library (ungrouped).`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/word-groups/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Delete failed");
      if (activeGroupId === id) selectGroup("all");
      await refreshGroups();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function moveGroup(id: string, direction: -1 | 1) {
    const index = groups.findIndex((g) => g.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= groups.length) return;
    const orderedIds = groups.map((g) => g.id);
    [orderedIds[index], orderedIds[target]] = [
      orderedIds[target]!,
      orderedIds[index]!,
    ];
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/word-groups/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Reorder failed");
      setGroups(data.groups);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reorder failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-ui)] text-sm font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
          Study groups
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectGroup("all")}
            className={`rounded-full px-3 py-1.5 font-[family-name:var(--font-ui)] text-xs ${
              activeGroupId === "all"
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "border border-[var(--line)] bg-[var(--surface)]"
            }`}
          >
            All words
          </button>
          <button
            type="button"
            onClick={() => selectGroup("ungrouped")}
            className={`rounded-full px-3 py-1.5 font-[family-name:var(--font-ui)] text-xs ${
              activeGroupId === "ungrouped"
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "border border-[var(--line)] bg-[var(--surface)]"
            }`}
          >
            Ungrouped
          </button>
        </div>
      </div>

      {groups.length ? (
        <ul className="space-y-2">
          {groups.map((group, index) => (
            <li
              key={group.id}
              className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 ${
                activeGroupId === group.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              }`}
            >
              {editingId === group.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="min-h-9 flex-1 rounded-lg border border-[var(--line)] px-2 text-sm"
                    aria-label="Group name"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveRename(group.id)}
                    className="rounded-lg bg-[var(--accent)] px-2 py-1 text-xs text-[var(--on-accent)]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => selectGroup(group.id)}
                    className="flex-1 text-left font-[family-name:var(--font-ui)] text-sm font-medium"
                  >
                    {group.name}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={busy || index === 0}
                      onClick={() => void moveGroup(group.id, -1)}
                      className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-40"
                      aria-label={`Move ${group.name} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={busy || index === groups.length - 1}
                      onClick={() => void moveGroup(group.id, 1)}
                      className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-40"
                      aria-label={`Move ${group.name} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(group.id);
                        setEditName(group.name);
                      }}
                      className="rounded-lg border border-[var(--line)] px-2 py-1 text-xs"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeGroup(group.id, group.name)}
                      className="rounded-lg border border-[var(--danger)]/40 px-2 py-1 text-xs text-[var(--danger)]"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)]">
          Create a group to organize words for focused review.
        </p>
      )}

      <form onSubmit={onCreate} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New group name"
          className="min-h-10 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm"
          aria-label="New group name"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="min-h-10 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-[var(--on-accent)] disabled:opacity-60"
        >
          Add group
        </button>
      </form>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
