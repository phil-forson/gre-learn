import { getEnv } from "@/lib/env";
import type { VocabularyRepository } from "./types";
import { createLocalRepository } from "./local";
import { createFirebaseRepository } from "./firebase";

let singleton: VocabularyRepository | null = null;

export function getVocabularyRepository(): VocabularyRepository {
  if (singleton) return singleton;
  const env = getEnv();
  singleton = env.DATA_DRIVER === "firebase"
    ? createFirebaseRepository()
    : createLocalRepository();
  return singleton;
}

/** Test helper */
export function setVocabularyRepositoryForTests(repo: VocabularyRepository | null) {
  singleton = repo;
}
