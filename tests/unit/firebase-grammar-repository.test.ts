import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import type {
  GrammarAudioLesson,
  GrammarProgress,
} from "@/features/grammar/types";

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

import { FirebaseGrammarRepository } from "@/features/grammar/repository/firebase";

function sampleProgress(
  overrides: Partial<GrammarProgress> = {},
): GrammarProgress {
  return {
    id: "gprog_1",
    userId: "user-a",
    unitId: "present-perfect-experience",
    status: "in_progress",
    microTaskPassed: false,
    knowledgeTestPassed: false,
    lastPlayedAt: null,
    reviewCount: 0,
    contentHash: "abc12345",
    dateUpdated: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function sampleLesson(
  overrides: Partial<GrammarAudioLesson> = {},
): GrammarAudioLesson {
  return {
    id: "glesson_1",
    userId: "user-a",
    grammarUnitId: "present-perfect-experience",
    contentHash: "abc12345",
    voice: "alloy",
    status: "ready",
    createdAt: "2026-01-01T00:00:00.000Z",
    segments: [
      {
        id: "seg_1",
        audioLessonId: "glesson_1",
        grammarUnitId: "present-perfect-experience",
        segmentKey: "title",
        segmentType: "title",
        order: 0,
        text: "Present Perfect",
        audioUrlOrStorageKey: "grammar/user-a/seg.mp3",
        durationMs: 1000,
        contentHash: "abc12345",
        status: "ready",
        error: null,
      },
    ],
    ...overrides,
  };
}

describe("FirebaseGrammarRepository", () => {
  let fake: ReturnType<typeof createFakeDb>;
  let repo: FirebaseGrammarRepository;

  beforeEach(() => {
    fake = createFakeDb();
    getDb.mockReturnValue(fake);
    repo = new FirebaseGrammarRepository();
  });

  it("uses grammarProgress and grammarAudioLessons — not vocab collections", async () => {
    await repo.upsertProgress(sampleProgress());
    await repo.saveAudioLesson(sampleLesson());

    const names = new Set(fake.writtenCollections);
    expect(names.has("grammarProgress")).toBe(true);
    expect(names.has("grammarAudioLessons")).toBe(true);
    expect(names.has("vocabulary")).toBe(false);
    expect(names.has("audioLessons")).toBe(false);
    expect(names.has("reviewEvents")).toBe(false);
    expect(names.has("wordGroups")).toBe(false);
  });

  it("scopes progress by userId and rejects mismatched get-by-id", async () => {
    await repo.upsertProgress(sampleProgress({ id: "gprog_a", userId: "user-a" }));
    await repo.upsertProgress(
      sampleProgress({
        id: "gprog_b",
        userId: "user-b",
        unitId: "other-unit",
      }),
    );

    const listed = await repo.listProgress("user-a");
    expect(listed).toHaveLength(1);
    expect(listed[0]!.userId).toBe("user-a");

    expect(await repo.getProgressById("user-b", "gprog_a")).toBeNull();
    expect(await repo.getProgressById("user-a", "gprog_a")).not.toBeNull();
  });

  it("keeps progress id stable on upsert for same userId+unitId", async () => {
    const first = await repo.upsertProgress(
      sampleProgress({ id: "gprog_stable", reviewCount: 0 }),
    );
    const second = await repo.upsertProgress(
      sampleProgress({
        id: "gprog_different",
        reviewCount: 3,
        status: "completed",
        microTaskPassed: true,
      }),
    );
    expect(second.id).toBe(first.id);
    expect(second.id).toBe("gprog_stable");
    expect(second.reviewCount).toBe(3);
    expect(second.status).toBe("completed");
  });

  it("rejects invalid progress and lesson writes via Zod", async () => {
    await expect(
      repo.upsertProgress(
        sampleProgress({
          status: "bogus" as unknown as GrammarProgress["status"],
        }),
      ),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      repo.saveAudioLesson(
        sampleLesson({
          status: "nope" as unknown as GrammarAudioLesson["status"],
        }),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("scopes audio lessons by userId and rejects mismatched get-by-id", async () => {
    await repo.saveAudioLesson(sampleLesson({ id: "gl_a", userId: "user-a" }));

    const hit = await repo.getAudioLesson(
      "user-a",
      "present-perfect-experience",
      "abc12345",
    );
    expect(hit?.id).toBe("gl_a");

    const miss = await repo.getAudioLesson(
      "user-b",
      "present-perfect-experience",
      "abc12345",
    );
    expect(miss).toBeNull();

    expect(await repo.getAudioLessonById("user-b", "gl_a")).toBeNull();
    expect(await repo.getAudioLessonById("user-a", "gl_a")).not.toBeNull();
  });
});
