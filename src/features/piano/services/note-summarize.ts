import { createHash } from "crypto";
import { getEnv } from "@/lib/env";
import { getSkillBySlug, listSkills } from "@/features/piano/catalog";

export type NoteSummarizeResult = {
  summary: string;
  skillSlugs: string[];
  practicePrompts: string[];
};

const KEYWORD_TO_SLUG: Array<{ pattern: RegExp; slug: string }> = [
  { pattern: /\b(2[\s-]?5[\s-]?1|ii[\s-]?v[\s-]?i|two[\s-]?five[\s-]?one)\b/i, slug: "two-five-one" },
  { pattern: /\brootless\b/i, slug: "rootless-a-b" },
  { pattern: /\bshell\b/i, slug: "shell-voicings" },
  { pattern: /\bvoicing/i, slug: "extension-voicings" },
  { pattern: /\bgospel\b/i, slug: "gospel-514" },
  { pattern: /\b(7[\s-]?3[\s-]?6|seven[\s-]?three[\s-]?six)\b/i, slug: "gospel-736" },
  { pattern: /\bmixolydian\b/i, slug: "mixolydian-deep" },
  { pattern: /\bdorian\b/i, slug: "dorian-deep" },
  { pattern: /\b(mode|modes)\b/i, slug: "seven-modes" },
  { pattern: /\bscale\b/i, slug: "major-scale-lab" },
  { pattern: /\bblues\b/i, slug: "gospel-blues-scale" },
  { pattern: /\bwalk(ing|up|down)?\b/i, slug: "walkups" },
  { pattern: /\bturnaround\b/i, slug: "turnarounds" },
  { pattern: /\bimprov/i, slug: "chord-tone-solo" },
  { pattern: /\bhymn\b/i, slug: "hymn-accompaniment" },
  { pattern: /\blead\s*sheet\b/i, slug: "lead-sheets" },
  { pattern: /\bswing\b/i, slug: "swing-feel" },
  { pattern: /\baltered\b/i, slug: "altered-dominants" },
  { pattern: /\btritone\b/i, slug: "tritone-subs" },
  { pattern: /\bmetronome\b/i, slug: "metronome-protocol" },
  { pattern: /\bleft\s*hand|\bLH\b/i, slug: "warren-lh-patterns" },
];

export function normalizeNoteText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

export function hashNoteText(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

function firstSentences(text: string, max = 2, maxLen = 280): string {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const joined = parts.slice(0, max).join(" ");
  if (joined.length <= maxLen) return joined || text.slice(0, maxLen);
  return `${joined.slice(0, maxLen - 1).trimEnd()}…`;
}

export function mockSummarizeNote(rawText: string): NoteSummarizeResult {
  const normalized = normalizeNoteText(rawText);
  const summary = firstSentences(normalized);
  const skillSlugs: string[] = [];
  for (const { pattern, slug } of KEYWORD_TO_SLUG) {
    if (pattern.test(normalized) && !skillSlugs.includes(slug)) {
      skillSlugs.push(slug);
    }
  }
  const prompts: string[] = [];
  for (const slug of skillSlugs.slice(0, 3)) {
    const skill = getSkillBySlug(slug);
    if (skill) prompts.push(skill.practicePrompt);
  }
  if (prompts.length === 0) {
    prompts.push(
      "Extract one concrete drill from these notes and practice it for 5 minutes.",
    );
  }
  return { summary, skillSlugs, practicePrompts: prompts };
}

async function openaiSummarizeNote(
  rawText: string,
): Promise<NoteSummarizeResult | null> {
  const env = getEnv();
  const key = env.AI_API_KEY;
  if (!key) return null;

  const skillSlugs = listSkills().map((s) => s.slug);
  const system = `You summarize piano practice YouTube notes for a gospel/jazz/classical intermediate learner.
Return JSON only: {"summary": string, "skillSlugs": string[], "practicePrompts": string[]}.
skillSlugs must be chosen from this allowlist: ${skillSlugs.join(", ")}.
Give 1-3 practicePrompts as concrete 1-sentence drills. summary max 280 chars.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.AI_MODEL || "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: rawText.slice(0, 12_000) },
      ],
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as Partial<NoteSummarizeResult>;
    const allow = new Set(skillSlugs);
    const slugs = Array.isArray(parsed.skillSlugs)
      ? parsed.skillSlugs.filter((s) => typeof s === "string" && allow.has(s))
      : [];
    const prompts = Array.isArray(parsed.practicePrompts)
      ? parsed.practicePrompts
          .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
          .map((p) => p.trim().slice(0, 500))
          .slice(0, 5)
      : [];
    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim().slice(0, 280)
        : firstSentences(normalizeNoteText(rawText));
    return {
      summary,
      skillSlugs: slugs,
      practicePrompts:
        prompts.length > 0
          ? prompts
          : mockSummarizeNote(rawText).practicePrompts,
    };
  } catch {
    return null;
  }
}

/** Server-side only. OpenAI when configured; else deterministic mock. */
export async function summarizeYoutubeNote(
  rawText: string,
): Promise<NoteSummarizeResult> {
  const env = getEnv();
  if (env.AI_PROVIDER === "openai" && env.AI_API_KEY) {
    const ai = await openaiSummarizeNote(rawText);
    if (ai) return ai;
  }
  return mockSummarizeNote(rawText);
}
