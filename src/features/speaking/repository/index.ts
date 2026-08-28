import { getEnv } from "@/lib/env";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { LocalSpeakingRepository } from "./local";
import { FirebaseSpeakingRepository } from "./firebase";
import type { SpeakingRepository } from "./types";

let singleton: SpeakingRepository | null = null;

export function getSpeakingRepository(): SpeakingRepository {
  if (singleton) return singleton;
  const env = getEnv();
  if (env.DATA_DRIVER === "firebase") {
    singleton = new FirebaseSpeakingRepository();
    return singleton;
  }
  const vocab = getVocabularyRepository();
  if (vocab instanceof LocalVocabularyRepository) {
    singleton = new LocalSpeakingRepository({ vocabRepo: vocab });
  } else {
    singleton = new LocalSpeakingRepository();
  }
  return singleton;
}

/** Test helper — pass a LocalSpeakingRepository bound to an isolated temp dataDir. */
export function setSpeakingRepositoryForTests(repo: SpeakingRepository | null) {
  singleton = repo;
}

export function createLocalSpeakingRepository(options?: {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
}): LocalSpeakingRepository {
  return new LocalSpeakingRepository(options);
}
