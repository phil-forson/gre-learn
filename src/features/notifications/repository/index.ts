import { getEnv } from "@/lib/env";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import { LocalNotificationRepository } from "./local";
import { FirebaseNotificationRepository } from "./firebase";
import type { NotificationRepository } from "./types";

let singleton: NotificationRepository | null = null;

export function getNotificationRepository(): NotificationRepository {
  if (singleton) return singleton;
  const env = getEnv();
  if (env.DATA_DRIVER === "firebase") {
    singleton = new FirebaseNotificationRepository();
    return singleton;
  }
  const vocab = getVocabularyRepository();
  if (vocab instanceof LocalVocabularyRepository) {
    singleton = new LocalNotificationRepository({ vocabRepo: vocab });
  } else {
    singleton = new LocalNotificationRepository();
  }
  return singleton;
}

/** Test helper — pass a LocalNotificationRepository bound to an isolated temp dataDir. */
export function setNotificationRepositoryForTests(
  repo: NotificationRepository | null,
) {
  singleton = repo;
}

export function createLocalNotificationRepository(options?: {
  dataDir?: string;
  vocabRepo?: LocalVocabularyRepository;
}): LocalNotificationRepository {
  return new LocalNotificationRepository(options);
}
