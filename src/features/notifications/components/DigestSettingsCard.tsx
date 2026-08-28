"use client";

import { useEffect, useState, useTransition } from "react";
import { registerFcmToken } from "@/features/notifications/client/fcm";
import type { NotificationPreferences } from "@/features/notifications/types";

const PAIRING_STORAGE_KEY = "gre-learn-notifications-pairing";

type FcmStatus = {
  clientConfigured: boolean;
  sendConfigured: boolean;
  authConfigured: boolean;
};

type PrefsResponse = {
  preferences: NotificationPreferences;
  fcm: FcmStatus;
};

function pairingHeaders(pairing: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Notifications-Pairing": pairing,
  };
}

export function DigestSettingsCard() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [fcm, setFcm] = useState<FcmStatus | null>(null);
  const [pairing, setPairing] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PAIRING_STORAGE_KEY);
      if (saved) setPairing(saved);
    } catch {
      /* ignore */
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications/preferences");
        const data = (await res.json()) as PrefsResponse & {
          error?: { message: string };
        };
        if (!res.ok) {
          throw new Error(data.error?.message ?? "Failed to load preferences");
        }
        if (!cancelled) {
          setPrefs(data.preferences);
          setFcm(data.fcm);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function rememberPairing(value: string) {
    setPairing(value);
    try {
      if (value) sessionStorage.setItem(PAIRING_STORAGE_KEY, value);
      else sessionStorage.removeItem(PAIRING_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function applyResponse(data: PrefsResponse) {
    setPrefs(data.preferences);
    setFcm(data.fcm);
  }

  function requirePairing(): string {
    const value = pairing.trim();
    if (!value) {
      throw new Error(
        "Enter your pairing code from NOTIFICATIONS_PAIRING_SECRET (or CRON_SECRET) in .env.local.",
      );
    }
    return value;
  }

  function patch(body: Record<string, unknown>) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const code = requirePairing();
        const res = await fetch("/api/notifications/preferences", {
          method: "PATCH",
          headers: pairingHeaders(code),
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as PrefsResponse & {
          error?: { message: string };
        };
        if (!res.ok) {
          throw new Error(data.error?.message ?? "Update failed");
        }
        applyResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  async function enableDigest() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const code = requirePairing();
        if (fcm && !fcm.authConfigured) {
          throw new Error(
            "Set NOTIFICATIONS_PAIRING_SECRET (or CRON_SECRET) in .env.local, then restart the server.",
          );
        }

        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const res = await fetch("/api/notifications/preferences", {
          method: "PATCH",
          headers: pairingHeaders(code),
          body: JSON.stringify({ enabled: true, timezone }),
        });
        const data = (await res.json()) as PrefsResponse & {
          error?: { message: string };
        };
        if (!res.ok) {
          throw new Error(data.error?.message ?? "Could not enable digests");
        }
        applyResponse(data);

        if (!data.fcm.clientConfigured) {
          setMessage(
            "Digests enabled. Push delivery needs Firebase web config + NEXT_PUBLIC_FIREBASE_VAPID_KEY.",
          );
          return;
        }

        const fcmResult = await registerFcmToken();
        if (!fcmResult.ok) {
          setMessage(
            `Digests enabled, but push setup paused: ${fcmResult.reason}`,
          );
          return;
        }

        const tokenRes = await fetch("/api/notifications/push-token", {
          method: "POST",
          headers: pairingHeaders(code),
          body: JSON.stringify({
            token: fcmResult.token,
            userAgent: navigator.userAgent,
          }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
          throw new Error(
            tokenData.error?.message ?? "Could not save push token",
          );
        }
        setMessage(
          "Today’s English digests are on. This device can receive push.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Enable failed");
      }
    });
  }

  function disableDigest() {
    patch({ enabled: false });
    setMessage("Digests turned off. Device tokens cleared.");
  }

  async function sendTest() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const code = requirePairing();
        const res = await fetch("/api/notifications/test", {
          method: "POST",
          headers: pairingHeaders(code),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message ?? "Test send failed");
        }
        const preview = data.preview
          ? ` “${data.preview.title}: ${data.preview.body}”`
          : "";
        setMessage(`${data.message ?? "Test complete."}${preview}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Test send failed");
      }
    });
  }

  if (!prefs && !error) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--ink-muted)]">
        Loading digest settings…
      </section>
    );
  }

  if (!prefs) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 text-sm text-[var(--danger)]">
        {error}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5">
      <div>
        <h2 className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Today’s English
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Evening habit reminder: grammar and vocab from today, or a specific
          next step when the day was quiet. Install to your home screen for the
          easiest open.
        </p>
      </div>

      <label className="flex flex-col gap-1 font-[family-name:var(--font-ui)] text-sm">
        <span className="text-[var(--ink-muted)]">Pairing code</span>
        <input
          type="password"
          autoComplete="off"
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
          value={pairing}
          onChange={(e) => rememberPairing(e.target.value)}
          placeholder="NOTIFICATIONS_PAIRING_SECRET from .env.local"
        />
        <span className="text-xs text-[var(--ink-muted)]">
          Kept in this browser session only. Required to enable digests, register
          this phone, or send a test.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {prefs.enabled ? (
          <button
            type="button"
            disabled={pending}
            onClick={disableDigest}
            className="rounded-full border border-[var(--line)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--ink)] disabled:opacity-60"
          >
            Turn off digests
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={enableDigest}
            className="rounded-full bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--on-accent)] disabled:opacity-60"
          >
            Enable digests
          </button>
        )}
        {prefs.enabled ? (
          <button
            type="button"
            disabled={pending}
            onClick={sendTest}
            className="rounded-full border border-[var(--line)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)] disabled:opacity-60"
          >
            Send test
          </button>
        ) : null}
      </div>

      {prefs.enabled ? (
        <div className="grid gap-3 font-[family-name:var(--font-ui)] text-sm sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[var(--ink-muted)]">Timezone</span>
            <input
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              onBlur={(e) => patch({ timezone: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--ink-muted)]">Send hour (local)</span>
            <select
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
              value={prefs.sendHourLocal}
              onChange={(e) => {
                const sendHourLocal = Number(e.target.value);
                setPrefs({ ...prefs, sendHourLocal });
                patch({ sendHourLocal });
              }}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--ink-muted)]">Quiet hours start</span>
            <select
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
              value={prefs.quietHoursStart ?? ""}
              onChange={(e) => {
                const quietHoursStart =
                  e.target.value === "" ? null : Number(e.target.value);
                setPrefs({ ...prefs, quietHoursStart });
                patch({ quietHoursStart });
              }}
            >
              <option value="">Off</option>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--ink-muted)]">Quiet hours end</span>
            <select
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
              value={prefs.quietHoursEnd ?? ""}
              onChange={(e) => {
                const quietHoursEnd =
                  e.target.value === "" ? null : Number(e.target.value);
                setPrefs({ ...prefs, quietHoursEnd });
                patch({ quietHoursEnd });
              }}
            >
              <option value="">Off</option>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.includeGrammar}
              onChange={(e) => {
                const includeGrammar = e.target.checked;
                setPrefs({ ...prefs, includeGrammar });
                patch({ includeGrammar });
              }}
            />
            Include grammar
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.includeVocab}
              onChange={(e) => {
                const includeVocab = e.target.checked;
                setPrefs({ ...prefs, includeVocab });
                patch({ includeVocab });
              }}
            />
            Include vocabulary
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.includePiano !== false}
              onChange={(e) => {
                const includePiano = e.target.checked;
                setPrefs({ ...prefs, includePiano });
                patch({ includePiano });
              }}
            />
            Include piano
          </label>
        </div>
      ) : null}

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm leading-relaxed text-[var(--ink-muted)]">
        <p className="font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.14em]">
          Install on your phone
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>iPhone (iOS 16.4+):</strong> Safari → Share → Add to Home
            Screen. Open gre-learn from that icon, then enable digests (Safari
            tabs alone won’t receive Web Push).
          </li>
          <li>
            <strong>Android (Chrome):</strong> menu → Install app / Add to Home
            screen, then enable digests and allow notifications.
          </li>
        </ul>
        {fcm ? (
          <p className="mt-2 text-xs">
            Push client: {fcm.clientConfigured ? "configured" : "not configured"}
            {" · "}
            Server send: {fcm.sendConfigured ? "configured" : "not configured"}
            {" · "}
            Pairing auth: {fcm.authConfigured ? "configured" : "not configured"}
          </p>
        ) : null}
      </div>

      {message ? (
        <p className="text-sm text-[var(--accent)]">{message}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      ) : null}
    </section>
  );
}
