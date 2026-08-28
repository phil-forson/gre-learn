import { getEnv } from "@/lib/env";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { LocalSentenceRepository } from "./local";
import { FirebaseSentenceRepository } from "./firebase";
import type { SentenceRepository } from "./types";

let singleton: SentenceRepository | null = null;

export function getSentenceRepository(): SentenceRepository {
  if (singleton) return singleton;
  const env = getEnv();
  if (env.DATA_DRIVER === "firebase") {
    singleton = new FirebaseSentenceRepository();
    return singleton;
  }
  const vocab = getVocabularyRepository();
  if (vocab instanceof LocalVocabularyRepository) {
    singleton = new LocalSentenceRepository({ vocabRepo: vocab });
  } else {
    singleton = new LocalSentenceRepository();
  }
  return singleton;
}

/** Test helper — pass a LocalSentenceRepository bound to an isolated temp dataDir. */
export function setSentenceRepositoryForTests(repo: SentenceRepository | null) {
  singleton = repo;
}

export function createLocalSentenceRepository(options?: {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
}): LocalSentenceRepository {
  return new LocalSentenceRepository(options);
}
