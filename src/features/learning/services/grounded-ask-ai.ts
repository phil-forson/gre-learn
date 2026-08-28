import { getEnv } from "@/lib/env";
import type { LearningSource } from "@/lib/learning-source";
import type { GroundedAskResponse } from "@/features/learning/schemas/grounded-ask";

export type GroundedAskContext = {
  title: string;
  exercise: string;
  /** Serialized lesson reference — only facts the model may use. */
  referencePack: string;
  sources: LearningSource[];
  glossary?: Array<{ term: string; meaning: string }>;
};

function formatSourcesBlock(sources: LearningSource[]): string {
  if (sources.length === 0) return "(No external sources listed.)";
  return sources
    .map(
      (s, i) =>
        `[${i + 1}] ${s.title}\n    URL: ${s.url}${s.note ? `\n    Note: ${s.note}` : ""}`,
    )
    .join("\n");
}

export function buildReferencePack(parts: Record<string, string | undefined>): string {
  return Object.entries(parts)
    .filter(([, v]) => v?.trim())
    .map(([key, value]) => `## ${key}\n${value!.trim()}`)
    .join("\n\n");
}

export function assembleGroundedContext(
  ctx: GroundedAskContext,
): string {
  const glossary =
    ctx.glossary?.length ?
      ctx.glossary.map((g) => `- ${g.term}: ${g.meaning}`).join("\n")
    : "(none)";

  return [
    `# Lesson: ${ctx.title}`,
    "",
    "## Exercise",
    ctx.exercise,
    "",
    ctx.referencePack,
    "",
    "## Glossary (in-lesson definitions only)",
    glossary,
    "",
    "## Allowed sources (cite by title when used)",
    formatSourcesBlock(ctx.sources),
  ].join("\n");
}

const SYSTEM_PROMPT = `You are a practice coach for a structured learning app.

STRICT RULES — violations are failures:
1. Answer ONLY using the REFERENCE PACK and ALLOWED SOURCES in the user message.
2. Do NOT invent fingerings, tempos, grammar rules, CEFR claims, chord symbols, or definitions not present in the pack.
3. If the question cannot be answered from the pack or sources, set cannotAnswer true and say clearly what is missing — suggest opening the listed source URLs.
4. Use plain language for an intermediate learner.
5. Keep answers under 220 words unless the user asks for step-by-step detail.
6. When you use a fact from an allowed source, include its exact title in citedSourceTitles.

Return JSON only:
{
  "answer": string,
  "citedSourceTitles": string[],
  "cannotAnswer": boolean
}`;

function mockGroundedAsk(
  ctx: GroundedAskContext,
  question: string,
): GroundedAskResponse {
  const q = question.toLowerCase();
  const glossary = ctx.glossary ?? [];

  for (const entry of glossary) {
    if (q.includes(entry.term.toLowerCase())) {
      return {
        answer: `${entry.term}: ${entry.meaning}`,
        citedSourceTitles: [],
        cannotAnswer: false,
        provider: "mock",
      };
    }
  }

  const pack = assembleGroundedContext(ctx).toLowerCase();
  const tokens = q.split(/\W+/).filter((t) => t.length > 3);
  const hits = tokens.filter((t) => pack.includes(t));
  if (hits.length >= 2) {
    const sourceHint =
      ctx.sources.length > 0 ?
        ` See also: ${ctx.sources.map((s) => s.title).join("; ")}.`
      : "";
    return {
      answer: `From today's lesson material (${hits.slice(0, 4).join(", ")}): check the steps and exercise above.${sourceHint} For a full AI explanation, set AI_PROVIDER=openai and AI_API_KEY in .env.local.`,
      citedSourceTitles: ctx.sources.map((s) => s.title),
      cannotAnswer: false,
      provider: "mock",
    };
  }

  return {
    answer: `I only answer from today's lesson and cited sources — I don't have enough on "${question.slice(0, 80)}" in this reference pack. Open the Sources links on this block, or enable OpenAI (AI_PROVIDER=openai) for grounded follow-up.`,
    citedSourceTitles: ctx.sources.map((s) => s.title),
    cannotAnswer: true,
    provider: "mock",
  };
}

async function openaiGroundedAsk(
  ctx: GroundedAskContext,
  question: string,
): Promise<GroundedAskResponse | null> {
  const env = getEnv();
  const key = env.AI_API_KEY;
  if (!key) return null;

  const allowedTitles = new Set(ctx.sources.map((s) => s.title));
  const reference = assembleGroundedContext(ctx);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.AI_MODEL || "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `REFERENCE PACK:\n${reference}\n\n---\n\nLearner question: ${question}`,
        },
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
    const parsed = JSON.parse(content) as Partial<GroundedAskResponse>;
    const answer =
      typeof parsed.answer === "string" && parsed.answer.trim() ?
        parsed.answer.trim().slice(0, 1200)
      : "Could not generate an answer.";
    const citedSourceTitles = Array.isArray(parsed.citedSourceTitles) ?
        parsed.citedSourceTitles
          .filter((t): t is string => typeof t === "string")
          .filter((t) => allowedTitles.has(t))
      : [];
    return {
      answer,
      citedSourceTitles,
      cannotAnswer: Boolean(parsed.cannotAnswer),
      provider: "openai",
    };
  } catch {
    return null;
  }
}

/** Server-side only. Uses OpenAI when configured; otherwise deterministic mock from reference pack. */
export async function askGroundedAi(
  ctx: GroundedAskContext,
  question: string,
): Promise<GroundedAskResponse> {
  const env = getEnv();
  if (env.AI_PROVIDER === "openai" && env.AI_API_KEY) {
    const ai = await openaiGroundedAsk(ctx, question);
    if (ai) return ai;
  }
  return mockGroundedAsk(ctx, question);
}
