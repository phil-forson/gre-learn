/** Strip whitespace and accidental inline `#` comments from public env values. */
export function sanitizePublicEnvValue(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  let trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  const hashIdx = trimmed.indexOf("#");
  if (hashIdx >= 0) {
    trimmed = trimmed.slice(0, hashIdx).trim();
  }

  return trimmed || undefined;
}

/** Firebase Web Push VAPID public keys are URL-safe base64. */
export function isLikelyVapidPublicKey(value: string): boolean {
  return /^[A-Za-z0-9_-]{80,256}$/.test(value);
}
