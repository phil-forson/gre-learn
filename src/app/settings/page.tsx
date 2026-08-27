import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getProviderStatus } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const providers = getProviderStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-[var(--ink-muted)]">
          Provider status and playback defaults. API keys are never shown here.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5">
        <ThemeToggle />
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 font-[family-name:var(--font-ui)] text-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Data & providers
        </h2>
        <StatusRow label="Data driver" value={providers.dataDriver} ok />
        <StatusRow
          label="Firebase Admin"
          value={providers.firebaseConfigured ? "configured" : "not configured"}
          ok={providers.firebaseConfigured || providers.dataDriver === "local"}
        />
        <StatusRow
          label="AI provider"
          value={`${providers.aiProvider}${providers.aiConfigured ? "" : " (missing key)"}`}
          ok={providers.aiConfigured}
        />
        <StatusRow
          label="TTS provider"
          value={`${providers.ttsProvider}${providers.ttsConfigured ? "" : " (missing key)"}`}
          ok={providers.ttsConfigured}
        />
        <StatusRow label="Preferred TTS voice" value={providers.ttsVoice} ok />
        <StatusRow
          label="Audio storage"
          value={providers.audioStorageDriver}
          ok
        />
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 text-sm leading-relaxed text-[var(--ink-muted)]">
        <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Notes
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>OpenAI word generation:</strong> one API call the first time you add a word.
            The full learning card is saved locally (or in Firebase). Re-adding the same
            word and browsing never regenerate the card.
          </li>
          <li>
            <strong>Regenerate</strong> on a word page is the only action that spends a
            new OpenAI call for an existing word’s learning content.
          </li>
          <li>
            <strong>TTS:</strong> with{" "}
            <code className="rounded bg-[var(--overlay)] px-1">TTS_PROVIDER=openai</code>{" "}
            and voice <code className="rounded bg-[var(--overlay)] px-1">nova</code>,
            audio review uses a consistent female American voice (MP3s cached per segment).
            First play of a word/lesson segment calls the TTS API once.
          </li>
          <li>
            Theme and playback speed are remembered in this browser.
          </li>
          <li>
            With <code className="rounded bg-[var(--overlay)] px-1">TTS_PROVIDER=mock</code>,
            audio uses free browser speech and picks a female en-US system voice when available.
          </li>
        </ul>
      </section>
    </div>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2 last:border-0">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className={ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}>
        {value}
      </span>
    </div>
  );
}
