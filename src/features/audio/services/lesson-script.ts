import type {
  AudioLessonSegment,
  VocabularyLearningContent,
} from "@/features/vocabulary/types";

function spellWord(word: string): string {
  return word
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .split("")
    .join(". ");
}

function primaryDefinition(content: VocabularyLearningContent): string {
  return (
    content.definitions.find((d) => d.isPrimary)?.text ??
    content.definitions[0]?.text ??
    ""
  );
}

function pronunciationLine(content: VocabularyLearningContent): string | null {
  const simple = content.pronunciation.simple?.trim();
  if (simple) return `Pronounced: ${simple}.`;
  const ipa = content.pronunciation.ipa?.trim();
  if (ipa) return `Pronounced: ${ipa}.`;
  return null;
}

function etymologyLine(content: VocabularyLearningContent): string {
  if (!content.etymology.isUsefulForRootLearning) {
    return (
      content.etymology.summary ||
      "This word is not especially useful to decompose into modern GRE-style roots."
    );
  }
  const parts = content.etymology.components
    .map((c) => `${c.text} (${c.meaning})`)
    .join("; ");
  const base = `Root and origin: ${content.etymology.summary}`;
  return parts ? `${base} Components: ${parts}.` : `${base}.`;
}

function synonymsLine(content: VocabularyLearningContent): string | null {
  if (!content.synonyms.length) return null;
  const list = content.synonyms.map((s) => s.word).join(", ");
  const lastComma = list.lastIndexOf(", ");
  const readable =
    lastComma === -1
      ? list
      : `${list.slice(0, lastComma)}, and ${list.slice(lastComma + 2)}`;
  return `Synonyms include ${readable}.`;
}

/**
 * Deterministic audio lesson script from saved learning content.
 * Transcript and TTS must share this exact object.
 */
export function buildAudioLessonScript(
  content: VocabularyLearningContent,
): AudioLessonSegment[] {
  const word = content.word;
  const segments: AudioLessonSegment[] = [];
  let order = 0;

  const push = (
    type: AudioLessonSegment["type"],
    text: string,
    pauseAfterMs = 350,
  ) => {
    segments.push({
      id: `${content.normalizedWord}_${type}_${order}`,
      type,
      text: text.trim(),
      order,
      pauseAfterMs,
    });
    order += 1;
  };

  push("word", `${word}.`, 450);
  push("spelling", `${spellWord(word)}.`, 500);

  const pronunciation = pronunciationLine(content);
  if (pronunciation) push("pronunciation", pronunciation, 400);

  const definition = primaryDefinition(content);
  if (definition) {
    push("definition", `${word} means ${definition.replace(/\.$/, "")}.`, 450);
  }

  push("etymology", etymologyLine(content), 450);
  push("memory_hook", `Memory hook: ${content.memoryHook.text}`, 450);

  const synonyms = synonymsLine(content);
  if (synonyms) push("synonyms", synonyms, 400);

  const example = content.exampleSentences[0]?.text;
  if (example) push("example", `Example: ${example}`, 500);

  return segments;
}

export function spellWordForNarration(word: string): string {
  return spellWord(word);
}
