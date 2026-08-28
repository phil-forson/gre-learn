import { getEnv } from "@/lib/env";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { LocalGrammarRepository } from "./local";
import { FirebaseGrammarRepository } from "./firebase";
import type { GrammarRepository } from "./types";

let singleton: GrammarRepository | null = null;

export function getGrammarRepository(): GrammarRepository {
  if (singleton) return singleton;
  const env = getEnv();
  if (env.DATA_DRIVER === "firebase") {
    singleton = new FirebaseGrammarRepository();
    return singleton;
  }
  const vocab = getVocabularyRepository();
  if (vocab instanceof LocalVocabularyRepository) {
    singleton = new LocalGrammarRepository({ vocabRepo: vocab });
  } else {
    singleton = new LocalGrammarRepository();
  }
  return singleton;
}

/** Test helper — pass a LocalGrammarRepository bound to an isolated temp dataDir. */
export function setGrammarRepositoryForTests(repo: GrammarRepository | null) {
  singleton = repo;
}

export function createLocalGrammarRepository(options?: {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
}): LocalGrammarRepository {
  return new LocalGrammarRepository(options);
}
