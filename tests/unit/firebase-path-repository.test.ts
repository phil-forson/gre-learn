import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEARNING_LOCALE } from "@/features/learning/types";
import { AppError } from "@/lib/errors";
import type { LearningProfile } from "@/features/path/types";

type DocData = Record<string, unknown>;

/** Minimal in-memory Firestore stand-in — no live Firebase. */
function createFakeDb() {
  const collections = new Map<string, Map<string, DocData>>();
  const writtenCollections: string[] = [];

  function colMap(name: string) {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  }

  function makeQuery(
    name: string,
    filters: Array<{ field: string; value: unknown }> = [],
  ) {
    return {
      where(field: string, _op: string, value: unknown) {
        return makeQuery(name, [...filters, { field, value }]);
      },
      limit(_n: number) {
        return makeQuery(name, filters);
      },
      async get() {
        let entries = [...colMap(name).entries()];
        for (const f of filters) {
          entries = entries.filter(([, data]) => data[f.field] === f.value);
        }
        const docs = entries.map(([id, data]) => ({
          id,
          exists: true,
          data: () => data,
        }));
        return { docs, empty: docs.length === 0 };
      },
    };
  }

  return {
    writtenCollections,
    collections,
    collection(name: string) {
      writtenCollections.push(name);
      return {
        doc(id: string) {
          return {
            async get() {
              const data = colMap(name).get(id);
              return {
                id,
                exists: data !== undefined,
                data: () => data,
              };
            },
            async set(data: DocData) {
              colMap(name).set(id, { ...data });
            },
            async delete() {
              colMap(name).delete(id);
            },
          };
        },
        where(field: string, op: string, value: unknown) {
          return makeQuery(name).where(field, op, value);
        },
      };
    },
  };
}

const getDb = vi.fn();

vi.mock("@/lib/db/firebase-admin", () => ({
  getDb: () => getDb(),
}));

import { FirebasePathRepository } from "@/features/path/repository/firebase";

describe("FirebasePathRepository", () => {
  let fake: ReturnType<typeof createFakeDb>;
  let repo: FirebasePathRepository;

  beforeEach(() => {
    fake = createFakeDb();
    getDb.mockReturnValue(fake);
    repo = new FirebasePathRepository();
  });

  it("writes to learningProfiles collection only", async () => {
    await repo.getOrCreateProfile("user-a");
    expect(fake.writtenCollections.every((c) => c === "learningProfiles")).toBe(
      true,
    );
    expect(fake.collections.has("learningProfiles")).toBe(true);
    expect(fake.collections.has("vocabulary")).toBe(false);
  });

  it("scopes lookup by userId and rejects mismatched get-by-id", async () => {
    const profile = await repo.getOrCreateProfile("user-a");
    expect(profile.userId).toBe("user-a");

    const other = await repo.getOrCreateProfile("user-b");
    expect(other.userId).toBe("user-b");
    expect(other.id).not.toBe(profile.id);

    const stolen = await repo.getProfileById("user-b", profile.id);
    expect(stolen).toBeNull();

    const owned = await repo.getProfileById("user-a", profile.id);
    expect(owned?.id).toBe(profile.id);
  });

  it("coerces legacy vocabulary activeTrackId to grammar", async () => {
    const created = await repo.getOrCreateProfile("user-a");
    const legacy: LearningProfile = {
      ...created,
      activeTrackId: "vocabulary",
      locale: LEARNING_LOCALE,
    };
    await fake.collection("learningProfiles").doc(legacy.id).set(legacy);

    const loaded = await repo.getOrCreateProfile("user-a");
    expect(loaded.activeTrackId).toBe("grammar");
    expect(loaded.id).toBe(created.id);
  });

  it("rejects invalid profile writes via Zod", async () => {
    await expect(
      repo.updateProfile("user-a", {
        cefrLevel: "B3" as unknown as LearningProfile["cefrLevel"],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("keeps profile id stable across updates", async () => {
    const first = await repo.getOrCreateProfile("user-a");
    const second = await repo.updateProfile("user-a", { pathMode: "fast" });
    expect(second.id).toBe(first.id);
    expect(second.pathMode).toBe("fast");
  });
});
