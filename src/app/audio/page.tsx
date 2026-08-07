import { Suspense } from "react";
import { AudioReviewPlayer } from "@/features/audio/player/AudioReviewPlayer";

export default function AudioPage() {
  return (
    <Suspense
      fallback={
        <p className="font-[family-name:var(--font-ui)] text-[var(--ink-muted)]">
          Loading player…
        </p>
      }
    >
      <AudioReviewPlayer />
    </Suspense>
  );
}
