import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationPreferences } from "@/features/notifications/types";
import { defaultNotificationPreferences } from "@/features/notifications/defaults";

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
          ref: { id, path: `${name}/${id}` },
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
    batch() {
      const ops: Array<() => void> = [];
      return {
        delete(ref: { id: string; path: string }) {
          const [col, id] = ref.path.split("/");
          ops.push(() => {
            if (col && id) colMap(col).delete(id);
          });
        },
        async commit() {
          for (const op of ops) op();
        },
      };
    },
  };
}

const getDb = vi.fn();

vi.mock("@/lib/db/firebase-admin", () => ({
  getDb: () => getDb(),
}));

describe("FirebaseNotificationRepository", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("creates default prefs and scopes tokens by userId", async () => {
    const db = createFakeDb();
    getDb.mockReturnValue(db);

    const { FirebaseNotificationRepository } = await import(
      "@/features/notifications/repository/firebase"
    );
    const repo = new FirebaseNotificationRepository();

    const prefs = await repo.getOrCreatePreferences("default-user");
    expect(prefs.enabled).toBe(false);
    expect(prefs.sendHourLocal).toBe(20);

    await repo.updatePreferences("default-user", { enabled: true });
    const token = await repo.upsertPushToken(
      "default-user",
      "token-firebase-abcdefghijklmnopqrstuvwxyz",
      null,
    );
    expect(token.userId).toBe("default-user");

    const listed = await repo.listPushTokens("default-user");
    expect(listed).toHaveLength(1);

    await repo.deleteAllPushTokens("default-user");
    expect(await repo.listPushTokens("default-user")).toHaveLength(0);
  });

  it("rejects mismatched userId on loaded prefs (via query filter)", async () => {
    const db = createFakeDb();
    getDb.mockReturnValue(db);
    const seeded: NotificationPreferences = {
      ...defaultNotificationPreferences("other-user"),
      id: "prefs1",
    };
    db.collections.set(
      "notificationPreferences",
      new Map([["prefs1", seeded as unknown as DocData]]),
    );

    const { FirebaseNotificationRepository } = await import(
      "@/features/notifications/repository/firebase"
    );
    const repo = new FirebaseNotificationRepository();
    const prefs = await repo.getOrCreatePreferences("default-user");
    expect(prefs.userId).toBe("default-user");
    expect(prefs.id).not.toBe("prefs1");
  });
});
