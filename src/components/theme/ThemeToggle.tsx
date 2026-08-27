"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: Array<{ value: ThemePreference; label: string; hint: string }> = [
  { value: "light", label: "Light", hint: "Warm paper" },
  { value: "dark", label: "Dark", hint: "Low light" },
  { value: "system", label: "System", hint: "Match device" },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <fieldset className="space-y-3">
      <legend className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
        Appearance
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setPreference(option.value)}
              className={`min-h-14 rounded-xl border px-2 py-2 font-[family-name:var(--font-ui)] text-sm transition-colors ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
              }`}
            >
              <span className="block font-medium">{option.label}</span>
              <span className="mt-0.5 block text-[11px] text-[var(--ink-muted)]">
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
