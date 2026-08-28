export function createId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function contentHash(parts: Array<string | number | null | undefined>): Promise<string> {
  const payload = parts.map((part) => String(part ?? "")).join("|");
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Deep-omit `undefined` so payloads are safe for Firestore `.set()`.
 * Firestore rejects undefined field values; `null` is kept.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) {
    return value;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (child === undefined) continue;
    out[key] = stripUndefinedDeep(child);
  }
  return out as T;
}
