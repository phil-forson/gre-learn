import { getEnv } from "@/lib/env";
import { getSkillTrack } from "@/features/path/catalog";
import { getPathRepository } from "@/features/path/repository";
import type { ContinueTarget, LearningProfile, SkillTrackId } from "@/features/path/types";
import {
  GRAMMAR_CONTINUE_LABEL,
  resolveGrammarContinueHref,
} from "@/features/grammar/catalog";
import {
  SENTENCE_CONTINUE_LABEL,
  resolveSentenceContinueHref,
} from "@/features/sentence/catalog";
import {
  SPEAKING_CONTINUE_LABEL,
  resolveSpeakingContinueHref,
} from "@/features/speaking/catalog";
import { nowIso } from "@/lib/utils";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

async function resolveTrackTarget(
  trackId: SkillTrackId,
): Promise<{ href: string; label: string }> {
  // Legacy vocabulary activeTrackId is coerced to grammar on profile load;
  // treat any residual as grammar continue.
  if (trackId === "vocabulary" || trackId === "grammar") {
    return resolveGrammarContinueHref();
  }

  if (trackId === "sentence") {
    return resolveSentenceContinueHref();
  }

  if (trackId === "speaking") {
    return resolveSpeakingContinueHref();
  }

  const track = getSkillTrack(trackId);
  if (!track) {
    return { href: "/path", label: "Open learning path" };
  }
  if (track.status === "live") {
    return { href: track.href, label: `Continue ${track.label}` };
  }
  return {
    href: track.href,
    label: `${track.label} — coming soon`,
  };
}

export async function resolveContinueTarget(): Promise<ContinueTarget> {
  const repo = getPathRepository();
  const profile = await repo.getOrCreateProfile(getUserId());

  if (profile.placementStatus === "not_started") {
    return {
      href: "/path/placement",
      label: "Take placement",
      trackId: profile.activeTrackId,
      needsPlacement: true,
    };
  }

  const target = await resolveTrackTarget(profile.activeTrackId);
  const hint = {
    trackId: profile.activeTrackId,
    href: target.href,
    label: target.label,
    updatedAt: nowIso(),
  };

  // Best-effort persist hint for UI badge; ignore race failures
  await repo.updateProfile(getUserId(), { continueHint: hint }).catch(() => undefined);

  return {
    ...target,
    trackId: profile.activeTrackId,
    needsPlacement: false,
  };
}

export async function getContinueWithProfile(): Promise<{
  continueTarget: ContinueTarget;
  profile: LearningProfile;
}> {
  const profile = await getPathRepository().getOrCreateProfile(getUserId());
  const continueTarget = await resolveContinueTarget();
  const refreshed = await getPathRepository().getOrCreateProfile(getUserId());
  return { continueTarget, profile: refreshed ?? profile };
}

export {
  GRAMMAR_CONTINUE_LABEL,
  SENTENCE_CONTINUE_LABEL,
  SPEAKING_CONTINUE_LABEL,
};
