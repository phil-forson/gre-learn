import { getEnv } from "@/lib/env";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { LocalPianoRepository } from "./local";
import { FirebasePianoRepository } from "./firebase";
import type { PianoRepository } from "./types";

let singleton: PianoRepository | null = null;

export function getPianoRepository(): PianoRepository {
  if (singleton) return singleton;
  const env = getEnv();
  if (env.DATA_DRIVER === "firebase") {
    singleton = new FirebasePianoRepository();
    return singleton;
  }
  const vocab = getVocabularyRepository();
  if (vocab instanceof LocalVocabularyRepository) {
    singleton = new LocalPianoRepository({ vocabRepo: vocab });
  } else {
    singleton = new LocalPianoRepository();
  }
  return singleton;
}

/** Test helper — pass a LocalPianoRepository bound to an isolated temp dataDir. */
export function setPianoRepositoryForTests(repo: PianoRepository | null) {
  singleton = repo;
}

export function createLocalPianoRepository(options?: {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
}): LocalPianoRepository {
  return new LocalPianoRepository(options);
}
