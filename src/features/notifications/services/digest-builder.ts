import { DIGEST_BRAND, type DigestBuildInput, type DigestPayload } from "@/features/notifications/types";

const MAX_GRAMMAR_TITLES = 2;
const MAX_VOCAB_SNIPPETS = 2;
const MAX_BODY = 160;

/** Format a Date as YYYY-MM-DD in an IANA timezone. */
export function localDayKey(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Local hour 0–23 in timezone. */
export function localHour(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(date);
    const hour = parts.find((p) => p.type === "hour")?.value;
    return hour ? Number(hour) : date.getUTCHours();
  } catch {
    return date.getUTCHours();
  }
}

/**
 * Quiet hours inclusive of start, exclusive of end.
 * Spans midnight when start > end (e.g. 22→7).
 */
export function isInQuietHours(
  hour: number,
  start: number | null,
  end: number | null,
): boolean {
  if (start === null || end === null) return false;
  if (start === end) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function isSafeAppPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("://");
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function primaryDef(definition: string): string {
  const cleaned = definition.replace(/\s+/g, " ").trim();
  return truncate(cleaned, 40);
}

function continueBody(label: string, needsPlacement: boolean): string {
  if (needsPlacement) {
    return "Next: Take placement to unlock your path";
  }
  return truncate(`Next: ${label}`, MAX_BODY);
}

function continueUrl(href: string, needsPlacement: boolean): string {
  if (needsPlacement) return "/path/placement";
  return isSafeAppPath(href) ? href : "/path";
}

/**
 * Pure “Today’s English” digest builder.
 * Returns null when the digest should not be sent (idempotent / quiet / skip empty).
 */
export function buildDailyDigest(
  input: DigestBuildInput,
): DigestPayload | null {
  const { prefs, now, continueTarget, force = false } = input;
  const tz = prefs.timezone || "UTC";
  const localDay = localDayKey(now, tz);

  if (!force && prefs.lastDigestSentOn === localDay) {
    return null;
  }

  const hour = localHour(now, tz);
  if (!force && isInQuietHours(hour, prefs.quietHoursStart, prefs.quietHoursEnd)) {
    return null;
  }

  const includePiano = prefs.includePiano !== false;
  const grammar = prefs.includeGrammar ? input.grammar : [];
  const vocabNew = prefs.includeVocab ? input.vocabNew : [];
  const vocabReviewed = prefs.includeVocab ? input.vocabReviewed : [];
  const piano = includePiano ? (input.piano ?? []) : [];

  const hasEnglishActivity =
    grammar.length > 0 || vocabNew.length > 0 || vocabReviewed.length > 0;
  const hasPianoActivity = piano.length > 0;
  const hasActivity = hasEnglishActivity || hasPianoActivity;

  if (!hasActivity) {
    if (prefs.skipEmptyDays) return null;
    const kind = continueTarget.needsPlacement ? "placement" : "continue";
    return {
      title: DIGEST_BRAND,
      body: continueBody(continueTarget.label, continueTarget.needsPlacement),
      url: continueUrl(continueTarget.href, continueTarget.needsPlacement),
      kind,
      localDay,
      grammarCount: 0,
      vocabNewCount: 0,
      vocabReviewedCount: 0,
      pianoCount: 0,
    };
  }

  const parts: string[] = [];

  if (grammar.length > 0) {
    const titles = grammar
      .slice(0, MAX_GRAMMAR_TITLES)
      .map((g) => g.title)
      .join(", ");
    const extra =
      grammar.length > MAX_GRAMMAR_TITLES
        ? ` +${grammar.length - MAX_GRAMMAR_TITLES}`
        : "";
    parts.push(`Grammar: ${titles}${extra}`);
  }

  if (vocabNew.length > 0 || vocabReviewed.length > 0) {
    const counts: string[] = [];
    if (vocabNew.length > 0) counts.push(`${vocabNew.length} new`);
    if (vocabReviewed.length > 0) {
      counts.push(`${vocabReviewed.length} reviewed`);
    }
    const snippets = [...vocabNew, ...vocabReviewed]
      .filter(
        (v, i, arr) =>
          arr.findIndex(
            (x) => x.word.toLowerCase() === v.word.toLowerCase(),
          ) === i,
      )
      .slice(0, MAX_VOCAB_SNIPPETS);
    const snippetText = snippets
      .map((v) => `${v.word}: ${primaryDef(v.definition)}`)
      .join("; ");
    const leftover =
      vocabNew.length + vocabReviewed.length - snippets.length;
    const more = leftover > 0 ? `; +${leftover}` : "";
    parts.push(
      `Vocab: ${counts.join(", ")}${snippetText ? ` — ${snippetText}` : ""}${more}`,
    );
  }

  if (piano.length > 0) {
    const label = piano[0]!.label;
    parts.push(`Piano: ${label}`);
  }

  const body = truncate(parts.join(" · "), MAX_BODY);
  const pianoOnly = hasPianoActivity && !hasEnglishActivity;
  const url = pianoOnly
    ? "/piano/today"
    : isSafeAppPath(continueTarget.href)
      ? continueTarget.href
      : "/path";

  return {
    title: DIGEST_BRAND,
    body,
    url,
    kind: "active",
    localDay,
    grammarCount: grammar.length,
    vocabNewCount: vocabNew.length,
    vocabReviewedCount: vocabReviewed.length,
    pianoCount: piano.length,
  };
}
