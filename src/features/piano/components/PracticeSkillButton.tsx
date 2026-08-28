"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PracticeSkillButton({ skillId }: { skillId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function practice() {
    setBusy(true);
    try {
      await fetch(`/api/piano/skills/${encodeURIComponent(skillId)}/practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={practice}
      className="font-[family-name:var(--font-ui)] text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-60"
    >
      {busy ? "…" : "Mark practiced"}
    </button>
  );
}
