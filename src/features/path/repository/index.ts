import { getEnv } from "@/lib/env";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { LocalPathRepository } from "./local";
import { FirebasePathRepository } from "./firebase";
import type { PathRepository } from "./types";

let singleton: PathRepository | null = null;

export function getPathRepository(): PathRepository {
  if (singleton) return singleton;
  const env = getEnv();
  if (env.DATA_DRIVER === "firebase") {
    singleton = new FirebasePathRepository();
    return singleton;
  }
  const vocab = getVocabularyRepository();
  if (vocab instanceof LocalVocabularyRepository) {
    singleton = new LocalPathRepository({ vocabRepo: vocab });
  } else {
    singleton = new LocalPathRepository();
  }
  return singleton;
}

/** Test helper — pass a LocalPathRepository bound to an isolated temp dataDir. */
export function setPathRepositoryForTests(repo: PathRepository | null) {
  singleton = repo;
}

export function createLocalPathRepository(options?: {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
}): LocalPathRepository {
  return new LocalPathRepository(options);
}
