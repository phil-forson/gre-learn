export type NormalizeResult =
  | { ok: true; normalized: string; display: string }
  | { ok: false; error: string };

/**
 * Normalize a vocabulary input for deduplication and storage.
 * Rules from build spec §5.
 */
export function normalizeWord(raw: string): NormalizeResult {
  if (typeof raw !== "string") {
    return { ok: false, error: "Word must be text." };
  }

  const unicodeNormalized = raw.normalize("NFC");
  const trimmed = unicodeNormalized.trim();

  if (!trimmed) {
    return { ok: false, error: "Enter a word to add." };
  }

  if (/\n|\r/.test(trimmed) || trimmed.split(/\s+/).length > 3) {
    return {
      ok: false,
      error: "Use a single word or short phrase. For many words, try batch add.",
    };
  }

  if (/[.!?]{2,}|[;:]/.test(trimmed) || (trimmed.match(/\s/g)?.length ?? 0) > 2) {
    return {
      ok: false,
      error: "This looks like a sentence. Enter a vocabulary word instead.",
    };
  }

  // Strip accidental surrounding punctuation; keep internal hyphens/apostrophes.
  const stripped = trimmed.replace(/^[\s"'“”‘’()[\]{}.,;:!?]+|[\s"'“”‘’()[\]{}.,;:!?]+$/g, "");

  if (!stripped) {
    return { ok: false, error: "Enter a valid word." };
  }

  if (!/^[A-Za-z][A-Za-z'’\-]*[A-Za-z]?$/.test(stripped) && stripped.length > 1) {
    // Allow simple multiword GRE phrases like "carte blanche" after trim
    if (!/^[A-Za-z][A-Za-z'’\-\s]*[A-Za-z]$/.test(stripped)) {
      return { ok: false, error: "Word contains unsupported characters." };
    }
  }

  const lower = stripped.toLocaleLowerCase("en-US");
  const normalized = lower.replace(/\s+/g, " ").replace(/’/g, "'");

  if (normalized.length < 2) {
    return { ok: false, error: "Word is too short." };
  }

  if (normalized.length > 40) {
    return { ok: false, error: "Word is too long." };
  }

  // Title-style display for single tokens; preserve multi-word lowercased first letter capitalize lightly
  const display = stripped
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return { ok: true, normalized, display };
}

export function normalizeBatchInput(raw: string): string[] {
  const parts = raw
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const normalized = normalizeWord(part);
    if (!normalized.ok) continue;
    if (seen.has(normalized.normalized)) continue;
    seen.add(normalized.normalized);
    result.push(part);
  }

  return result;
}
