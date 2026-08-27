"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent, type PointerEvent } from "react";

type Props = {
  vocabularyId: string;
  isFavorite: boolean;
  /** Icon star for lists/player; labeled button for detail. */
  variant?: "icon" | "button";
  className?: string;
  onToggled?: (next: boolean) => void;
  /** Default true — skip when the caller only updates local state. */
  refresh?: boolean;
};

export function FavoriteToggle({
  vocabularyId,
  isFavorite,
  variant = "icon",
  className,
  onToggled,
  refresh = true,
}: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(isFavorite);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite);
  }, [isFavorite, vocabularyId]);

  async function toggle(event: MouseEvent | PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;

    const previous = favorited;
    const next = !favorited;
    setFavorited(next);
    setBusy(true);

    try {
      const response = await fetch(`/api/vocabulary/${vocabularyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "favorite" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message ?? "Favorite failed");
      }
      const confirmed = Boolean(data.entry?.isFavorite);
      setFavorited(confirmed);
      onToggled?.(confirmed);
      if (refresh) router.refresh();
    } catch {
      setFavorited(previous);
    } finally {
      setBusy(false);
    }
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        disabled={busy}
        aria-pressed={favorited}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        onClick={toggle}
        onPointerDown={(e) => e.stopPropagation()}
        className={
          className ??
          "min-h-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 font-[family-name:var(--font-ui)] text-sm disabled:opacity-60"
        }
      >
        {favorited ? "Unfavorite" : "Favorite"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      onClick={toggle}
      onPointerDown={(e) => e.stopPropagation()}
      className={
        className ??
        "inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-xl text-lg leading-none text-[var(--hook)] transition hover:bg-[var(--surface-muted)] disabled:opacity-60"
      }
    >
      {favorited ? "★" : "☆"}
    </button>
  );
}
