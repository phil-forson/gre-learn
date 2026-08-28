import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import type { PianoProfile, YoutubeNote } from "@/features/piano/types";

type DocData = Record<string, unknown>;

function createFakeDb() {
  const collections = new Map<string, Map<string, DocData>>();

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
    collections,
    collection(name: string) {
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

import { FirebasePianoRepository } from "@/features/piano/repository/firebase";

function sampleNote(overrides: Partial<YoutubeNote> = {}): YoutubeNote {
  return {
    id: "note_1",
    userId: "user-a",
    rawText: "Rootless voicings Type A for ii-V-I",
    summary: "Rootless Type A practice",
    skillTagIds: ["skill_rootless_a"],
    practicePrompts: ["Practice Type A in C"],
    mappedPhaseIndex: 0,
    status: "mapped",
    contentHash: "abc123def456",
    dateCreated: "2026-01-01T00:00:00.000Z",
    dateUpdated: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function sampleProfile(overrides: Partial<PianoProfile> = {}): PianoProfile {
  return {
    id: "pianoprofile_1",
    userId: "user-a",
    activePhaseIndex: 0,
    templateId: "daily-60",
    remindersEnabled: true,
    timezone: "UTC",
    continueHint: { href: "/piano/today", label: "Practice today" },
    dateCreated: "2026-01-01T00:00:00.000Z",
    dateUpdated: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("FirebasePianoRepository", () => {
  let fake: ReturnType<typeof createFakeDb>;
  let repo: FirebasePianoRepository;

  beforeEach(() => {
    fake = createFakeDb();
    getDb.mockReturnValue(fake);
    repo = new FirebasePianoRepository();
  });

  it("rejects upsertNote when existing doc belongs to another user", async () => {
    await fake.collection("youtubeNotes").doc("note_1").set(sampleNote());
    await expect(
      repo.upsertNote(sampleNote({ userId: "user-b", summary: "hijack" })),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<AppError>);
  });

  it("rejects upsertProfile when existing doc belongs to another user", async () => {
    await fake
      .collection("pianoProfiles")
      .doc("pianoprofile_1")
      .set(sampleProfile());
    await expect(
      repo.upsertProfile(sampleProfile({ userId: "user-b" })),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<AppError>);
  });

  it("getNote returns null for other users (read IDOR)", async () => {
    await fake.collection("youtubeNotes").doc("note_1").set(sampleNote());
    await expect(repo.getNote("user-b", "note_1")).resolves.toBeNull();
  });
});
