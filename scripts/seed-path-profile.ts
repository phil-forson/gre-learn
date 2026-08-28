/**
 * Opt-in Path profile seed for the single DEFAULT_USER_ID learner.
 *
 * NEVER run from tests / beforeEach. Writes the real local store only when
 * invoked explicitly (e.g. `npm run seed:path-profile`).
 *
 * Defaults (Director lock):
 * - cefrLevel: B2
 * - activeTrackId: speaking
 * - placementStatus: skipped
 */
import { getEnv } from "../src/lib/env";
import { createLocalPathRepository } from "../src/features/path/repository";

async function main() {
  process.env.DATA_DRIVER = process.env.DATA_DRIVER || "local";
  const userId = process.env.DEFAULT_USER_ID || getEnv().DEFAULT_USER_ID;
  const repo = createLocalPathRepository();

  const prior = await repo.getOrCreateProfile(userId);
  await repo.skipPlacement(userId, "B2");
  const updated = await repo.updateProfile(userId, {
    activeTrackId: "speaking",
  });

  console.log("Seeded Path profile (opt-in):");
  console.log(`  userId=${userId}`);
  console.log(`  prior.activeTrackId=${prior.activeTrackId}`);
  console.log(`  prior.cefrLevel=${prior.cefrLevel}`);
  console.log(`  next.activeTrackId=${updated.activeTrackId}`);
  console.log(`  next.cefrLevel=${updated.cefrLevel}`);
  console.log(`  next.placementStatus=${updated.placementStatus}`);
  console.log("Done. Speaking A2–B1 units remain in the continue path.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
