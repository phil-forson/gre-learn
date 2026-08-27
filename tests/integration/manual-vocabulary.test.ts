import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { setVocabularyRepositoryForTests } from "@/features/vocabulary/repository";
import {
  addManualVocabularyWord,
  batchAddManualVocabulary,
} from "@/features/vocabulary/services/vocabulary-service";
import { parseManualVocabularyCards } from "@/features/vocabulary/services/parse-manual-card";

let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-manual-test-"));
}

describe("manual vocabulary import integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
    setVocabularyRepositoryForTests(
      new LocalVocabularyRepository({ dataDir: testDataDir }),
    );
  });

  afterEach(async () => {
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("imports manual cards without calling OpenAI", async () => {
    const card = parseManualVocabularyCards(`Austere
Meaning: Very plain, strict, or severe in appearance or manner.
Common Link: Stern
Breakdown: From Greek austeros, meaning "harsh" or "severe."
Memory Trick: Austere = severe and stripped of comfort.
Sentence: The office had an austere design with little decoration.`)[0]!;

    const result = await addManualVocabularyWord(card);
    expect(result.created).toBe(true);
    expect(result.replaced).toBe(false);
    expect(result.entry.status).toBe("ready");
    expect(result.entry.generationProvider).toBe("manual");
    expect(result.entry.content?.memoryHook.text).toContain("stripped of comfort");
    expect(result.entry.content?.definitions[0]?.text).toContain("plain, strict");

    const repo = new LocalVocabularyRepository({ dataDir: testDataDir });
    const saved = await repo.getByNormalizedWord("default-user", "austere");
    expect(saved?.generationProvider).toBe("manual");
  });

  it("replaces existing words with manual notes", async () => {
    const text = `Austere
Meaning: Very plain, strict, or severe in appearance or manner.
Common Link: Stern
Breakdown: From Greek austeros.
Memory Trick: Austere = severe and stripped of comfort.
Sentence: The office had an austere design with little decoration.`;

    const first = await batchAddManualVocabulary(text);
    expect(first[0]?.ok).toBe(true);
    expect(first[0]?.replaced).toBe(false);

    const second = await batchAddManualVocabulary(`Austere
Meaning: My updated meaning for austere.
Common Link: Stern
Breakdown: My personal breakdown.
Memory Trick: My personal trick.
Sentence: My personal sentence.`);
    expect(second[0]?.ok).toBe(true);
    expect(second[0]?.replaced).toBe(true);
    expect(second[0]?.entry.content?.definitions[0]?.text).toBe(
      "My updated meaning for austere.",
    );
    expect(second[0]?.entry.generationProvider).toBe("manual");
  });
});
