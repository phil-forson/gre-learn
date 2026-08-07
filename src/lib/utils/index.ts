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
