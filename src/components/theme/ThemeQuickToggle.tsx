"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeQuickToggle() {
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 font-[family-name:var(--font-ui)] text-xs font-medium text-[var(--ink)]"
      aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {resolved === "dark" ? "Light" : "Dark"}
    </button>
  );
}
