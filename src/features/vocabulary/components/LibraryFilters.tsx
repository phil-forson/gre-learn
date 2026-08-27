"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  query: string;
  sort: "alpha" | "newest" | "oldest";
  favorites: boolean;
  status: string;
};

export function LibraryFilters({ query, sort, favorites, status }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(query);

  function apply(next: Partial<Props> & { q?: string }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextSort = next.sort ?? sort;
    const nextFav = next.favorites ?? favorites;
    const nextStatus = next.status ?? status;
    if (nextQ) params.set("q", nextQ);
    if (nextSort) params.set("sort", nextSort);
    if (nextFav) params.set("favorites", "1");
    if (nextStatus) params.set("status", nextStatus);
    router.push(`/library?${params.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply({ q });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 font-[family-name:var(--font-ui)] sm:flex-row sm:flex-wrap sm:items-center"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search words…"
        className="min-h-11 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm"
        aria-label="Search vocabulary"
      />
      <select
        value={sort}
        onChange={(e) =>
          apply({ sort: e.target.value as Props["sort"] })
        }
        className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)]"
        aria-label="Sort"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="alpha">A–Z</option>
      </select>
      <select
        value={status}
        onChange={(e) => apply({ status: e.target.value })}
        className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)]"
        aria-label="Status filter"
      >
        <option value="">All statuses</option>
        <option value="ready">Ready</option>
        <option value="audio_ready">Audio ready</option>
        <option value="generation_failed">Generation failed</option>
        <option value="audio_failed">Audio failed</option>
      </select>
      <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm">
        <input
          type="checkbox"
          checked={favorites}
          onChange={(e) => apply({ favorites: e.target.checked })}
        />
        Favorites
      </label>
      <button
        type="submit"
        className="min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-[var(--on-accent)]"
      >
        Search
      </button>
    </form>
  );
}
