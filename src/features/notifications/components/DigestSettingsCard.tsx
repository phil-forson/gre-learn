"use client";

import { useEffect, useRef, useState } from "react";
import {
  listenForForegroundMessages,
  registerFcmToken,
} from "@/features/notifications/client/fcm";
import {
  readPushEnvironment,
  type PushEnvironment,
} from "@/features/notifications/client/push-diagnostics";
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
  deviceTokenCount?: number;
};

type BusyAction = "enable" | "disable" | "register" | "test" | null;

const LOCAL_TOKEN_KEY = "gre-learn-fcm-token-preview";

const actionButtonClass =
  "inline-flex min-h-11 touch-manipulation select-none items-center justify-center rounded-full border border-[var(--line)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm disabled:pointer-events-none disabled:opacity-50";

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
  const [deviceTokenCount, setDeviceTokenCount] = useState<number | null>(null);
  const [localTokenPreview, setLocalTokenPreview] = useState<string | null>(
    null,
  );
  const [pushEnv, setPushEnv] = useState<PushEnvironment | null>(null);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const patchSeq = useRef(0);

  const actionLocked = busyAction !== null;

  async function refreshPrefs() {
    const res = await fetch("/api/notifications/preferences");
    const data = (await res.json()) as PrefsResponse & {
      error?: { message: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message ?? "Failed to load preferences");
    }
    setPrefs(data.preferences);
    setFcm(data.fcm);
    setDeviceTokenCount(data.deviceTokenCount ?? 0);
  }

  async function registerThisPhone(code: string) {
    const fcmResult = await registerFcmToken();
    if (!fcmResult.ok) {
      throw new Error(fcmResult.reason);
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
      throw new Error(tokenData.error?.message ?? "Could not save push token");
    }
    try {
      sessionStorage.setItem(LOCAL_TOKEN_KEY, fcmResult.token);
    } catch {
      /* ignore */
    }
    setLocalTokenPreview(fcmResult.token);
    await refreshPrefs();
    return fcmResult.token;
  }

  useEffect(() => {
    setPushEnv(readPushEnvironment());
  }, []);

  useEffect(() => {
    if (!prefs?.enabled) return;
    return listenForForegroundMessages((title, body) => {
      setMessage(`Received: ${title} — ${body}`);
    });
  }, [prefs?.enabled]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PAIRING_STORAGE_KEY);
      if (saved) setPairing(saved);
      const savedToken = sessionStorage.getItem(LOCAL_TOKEN_KEY);
      if (savedToken) setLocalTokenPreview(savedToken);
    } catch {
      /* ignore */
    }

    let cancelled = false;
    (async () => {
      try {
        await refreshPrefs();
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
    if (data.deviceTokenCount !== undefined) {
      setDeviceTokenCount(data.deviceTokenCount);
    }
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

  /** Background preference saves — never lock action buttons. */
  function patch(body: Record<string, unknown>) {
    const seq = ++patchSeq.current;
    void (async () => {
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
        if (seq === patchSeq.current) {
          applyResponse(data);
        }
      } catch (err) {
        if (seq === patchSeq.current) {
          setError(err instanceof Error ? err.message : "Update failed");
        }
      }
    })();
  }

  async function enableDigest() {
    if (actionLocked) return;
    setError(null);
    setMessage(null);
    setBusyAction("enable");
    setBusyLabel("Enabling digests…");
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

      setBusyLabel("Registering this phone…");
      const fcmResult = await registerFcmToken();
      if (!fcmResult.ok) {
        setMessage(`Digests enabled, but push setup paused: ${fcmResult.reason}`);
        setPushEnv(readPushEnvironment());
        return;
      }

      await registerThisPhone(code);
      setPushEnv(readPushEnvironment());
      setMessage(
        "Today’s English digests are on. This device can receive push.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enable failed");
    } finally {
      setBusyAction(null);
      setBusyLabel(null);
    }
  }

  async function disableDigest() {
    if (actionLocked) return;
    setError(null);
    setMessage(null);
    setBusyAction("disable");
    setBusyLabel("Turning off digests…");
    try {
      const code = requirePairing();
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: pairingHeaders(code),
        body: JSON.stringify({ enabled: false }),
      });
      const data = (await res.json()) as PrefsResponse & {
        error?: { message: string };
      };
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Could not disable digests");
      }
      applyResponse(data);
      await refreshPrefs();
      setMessage("Digests turned off. Device tokens cleared.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disable failed");
    } finally {
      setBusyAction(null);
      setBusyLabel(null);
    }
  }

  async function registerPhoneOnly() {
    if (actionLocked) return;
    setError(null);
    setMessage(null);
    setBusyAction("register");
    setBusyLabel("Registering this phone…");
    try {
      const code = requirePairing();
      await registerThisPhone(code);
      setPushEnv(readPushEnvironment());
      setMessage(
        "Phone registered for push. You can Send test or paste the token into Firebase Console.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setPushEnv(readPushEnvironment());
    } finally {
      setBusyAction(null);
      setBusyLabel(null);
    }
  }

  async function sendTest() {
    if (actionLocked) return;
    setError(null);
    setMessage(null);
    setBusyAction("test");
    setBusyLabel("Registering phone, then sending test…");
    try {
      const code = requirePairing();

      await registerThisPhone(code);
      setPushEnv(readPushEnvironment());

      setBusyLabel("Sending test notification…");
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
      const err =
        data.result?.errors?.[0] && !data.ok
          ? ` (${data.result.errors[0]})`
          : "";
      if (!data.ok) {
        setError(`${data.message ?? "Test send failed."}${preview}${err}`);
        return;
      }
      setMessage(`${data.message ?? "Test complete."}${preview}${err}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test send failed");
      setPushEnv(readPushEnvironment());
    } finally {
      setBusyAction(null);
      setBusyLabel(null);
    }
  }

  function copyLocalToken() {
    if (!localTokenPreview) return;
    void navigator.clipboard.writeText(localTokenPreview).then(() => {
      setMessage("FCM token copied — paste into Firebase “Test on device”.");
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
          Evening habit reminder: grammar and vocab from today, a random grammar
          tip (~half of evenings), or a specific next step when the day was
          quiet. Install to your home screen for the easiest open.
        </p>
      </div>

      <label className="flex flex-col gap-1 font-[family-name:var(--font-ui)] text-sm">
        <span className="text-[var(--ink-muted)]">Pairing code</span>
        <input
          type="password"
          autoComplete="off"
          className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 touch-manipulation"
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
            disabled={actionLocked}
            onClick={() => void disableDigest()}
            className={`${actionButtonClass} font-medium text-[var(--ink)]`}
          >
            Turn off digests
          </button>
        ) : (
          <button
            type="button"
            disabled={actionLocked}
            onClick={() => void enableDigest()}
            className="inline-flex min-h-11 touch-manipulation select-none items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--on-accent)] disabled:pointer-events-none disabled:opacity-50"
          >
            Enable digests
          </button>
        )}
        {prefs.enabled ? (
          <button
            type="button"
            disabled={actionLocked}
            onClick={() => void registerPhoneOnly()}
            className={`${actionButtonClass} text-[var(--ink-muted)]`}
          >
            Register this phone
          </button>
        ) : null}
        {prefs.enabled ? (
          <button
            type="button"
            disabled={actionLocked}
            onClick={() => void sendTest()}
            className={`${actionButtonClass} text-[var(--ink-muted)]`}
          >
            Send test
          </button>
        ) : null}
      </div>

      {busyLabel ? (
        <p className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--ink)]">
          {busyLabel}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-[var(--danger)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--accent)]">
          {message}
        </p>
      ) : null}

      {pushEnv && prefs.enabled ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--ink-muted)]">
          <p className="font-[family-name:var(--font-ui)] font-medium text-[var(--ink)]">
            This device
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>
              Home Screen app:{" "}
              {pushEnv.standalone ? "yes ✓" : "no — add to Home Screen first"}
            </li>
            <li>
              Notification permission:{" "}
              {pushEnv.permission === "unsupported"
                ? "not supported"
                : pushEnv.permission}
            </li>
            <li>
              Can register for push:{" "}
              {pushEnv.readyForRegister ? "yes ✓" : "not yet"}
            </li>
          </ul>
          {pushEnv.hints.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[var(--ink)]">
              {pushEnv.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {prefs.enabled && deviceTokenCount !== null ? (
        <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
          Devices registered on server: {deviceTokenCount}.{" "}
          {deviceTokenCount === 0
            ? "Tap Register this phone first — Firebase Console “Test on device” will stay empty until the app saves a token."
            : "Send test uses these tokens."}
        </p>
      ) : null}

      {localTokenPreview ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs">
          <p className="font-[family-name:var(--font-ui)] font-medium text-[var(--ink)]">
            FCM token (for Firebase Console → Messaging → Test on device)
          </p>
          <p className="mt-1 break-all font-mono text-[var(--ink-muted)]">
            {localTokenPreview.slice(0, 24)}…{localTokenPreview.slice(-12)}
          </p>
          <button
            type="button"
            onClick={copyLocalToken}
            className="mt-2 inline-flex min-h-9 touch-manipulation select-none items-center rounded-full border border-[var(--line)] px-3 py-1 font-[family-name:var(--font-ui)] text-xs"
          >
            Copy full token
          </button>
        </div>
      ) : null}

      {prefs.enabled ? (
        <div className="grid gap-3 font-[family-name:var(--font-ui)] text-sm sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[var(--ink-muted)]">Timezone</span>
            <input
              className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 touch-manipulation"
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              onBlur={(e) => patch({ timezone: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[var(--ink-muted)]">Send hour (local)</span>
            <select
              className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 touch-manipulation"
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
              className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 touch-manipulation"
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
              className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 touch-manipulation"
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
          <label className="flex flex-col gap-2 touch-manipulation">
            <span className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={prefs.includeGrammar}
                onChange={(e) => {
                  const includeGrammar = e.target.checked;
                  setPrefs({ ...prefs, includeGrammar });
                  patch({ includeGrammar });
                }}
              />
              Include grammar (today’s units + random tips)
            </span>
          </label>
          <label className="flex flex-col gap-2 touch-manipulation">
            <span className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={prefs.includeVocab}
                onChange={(e) => {
                  const includeVocab = e.target.checked;
                  setPrefs({ ...prefs, includeVocab });
                  patch({ includeVocab });
                }}
              />
              Include vocabulary
            </span>
          </label>
          <label className="flex flex-col gap-2 touch-manipulation">
            <span className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={prefs.includePiano !== false}
                onChange={(e) => {
                  const includePiano = e.target.checked;
                  setPrefs({ ...prefs, includePiano });
                  patch({ includePiano });
                }}
              />
              Include piano
            </span>
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
        <p className="mt-3 font-[family-name:var(--font-ui)] text-xs font-semibold uppercase tracking-[0.14em]">
          Not the same as Firebase “Compose notification”
        </p>
        <p className="mt-1 text-xs">
          Firebase Console → Messaging → Test on device needs an FCM token from
          this app (Register this phone → Copy full token). Our Send test goes
          through gre-learn directly — use that first.
        </p>
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
    </section>
  );
}
