import { contentHash, createId, nowIso } from "../src/lib/utils";
import { SEED_CONTENT } from "../src/features/generation/seed-content";
import { LocalVocabularyRepository } from "../src/features/vocabulary/repository/local";
import type { VocabularyEntry } from "../src/features/vocabulary/types";

async function main() {
  process.env.DATA_DRIVER = process.env.DATA_DRIVER || "local";
  const userId = process.env.DEFAULT_USER_ID || "default-user";
  const repo = new LocalVocabularyRepository();

  let created = 0;
  let skipped = 0;

  for (const content of Object.values(SEED_CONTENT)) {
    const existing = await repo.getByNormalizedWord(
      userId,
      content.normalizedWord,
    );
    if (existing) {
      skipped += 1;
      continue;
    }

    const hash = await contentHash([
      content.normalizedWord,
      content.definitions[0]?.text,
      content.memoryHook.text,
      content.etymology.summary,
      content.exampleSentences[0]?.text,
      JSON.stringify(content.synonyms),
    ]);

    const now = nowIso();
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId,
      word: content.word,
      normalizedWord: content.normalizedWord,
      partOfSpeech: content.partOfSpeech,
      status: "ready",
      isFavorite: false,
      dateAdded: now,
      dateUpdated: now,
      lastReviewedAt: null,
      reviewCount: 0,
      contentVersion: 1,
      contentHash: hash,
      generationProvider: "seed",
      generationModel: "demo-v1",
      generationError: null,
      audioStatus: "none",
      audioError: null,
      personalNote: null,
      content,
      isDemo: true,
    };

    await repo.create(entry);
    created += 1;
    console.log(`seeded: ${content.word}`);
  }

  console.log(`Done. created=${created} skipped=${skipped}`);
  console.log("Seed content is development/demo data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
