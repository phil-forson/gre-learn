"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { LEARNING_LOCALE } from "@/features/learning/types";
import type { PlayerSegment } from "@/features/learning/types";
import {
  PLAYBACK_RATES,
  initialPlayerState,
  playerReducer,
  type PlayerState,
} from "./state";

const RATE_KEY = "gre-learn-playback-rate";
const ACTIVE_GROUP_KEY = "gre-learn-active-group-id";

type WordGroupSummary = { id: string; name: string; sortOrder: string };

function speakBrowser(
  text: string,
  rate: number,
  onEnd: () => void,
  onError: (message: string) => void,
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError("Speech synthesis is not available in this browser.");
    return () => {};
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = LEARNING_LOCALE;
  utter.rate = rate;
  utter.onend = onEnd;
  utter.onerror = () => onError("Could not speak this segment.");
  window.speechSynthesis.speak(utter);
  return () => {
    window.speechSynthesis.cancel();
  };
}

export function AudioReviewPlayer() {
  const searchParams = useSearchParams();
  const focusWord = searchParams.get("word");
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [ready, setReady] = useState(false);
  const [groups, setGroups] = useState<WordGroupSummary[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupReady, setGroupReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelSpeakRef = useRef<(() => void) | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const saved = localStorage.getItem(RATE_KEY);
    if (saved) {
      const rate = Number(saved);
      if (PLAYBACK_RATES.includes(rate as (typeof PLAYBACK_RATES)[number])) {
        dispatch({ type: "SET_RATE", rate });
      }
    }

    const savedGroup = localStorage.getItem(ACTIVE_GROUP_KEY);
    void fetch("/api/word-groups")
      .then((response) => response.json())
      .then((data) => {
        const nextGroups: WordGroupSummary[] = data.groups ?? [];
        setGroups(nextGroups);
        if (
          savedGroup &&
          nextGroups.some((g) => g.id === savedGroup)
        ) {
          setActiveGroupId(savedGroup);
        } else {
          setActiveGroupId(null);
          if (savedGroup) localStorage.removeItem(ACTIVE_GROUP_KEY);
        }
      })
      .catch(() => {
        setActiveGroupId(null);
      })
      .finally(() => {
        setGroupReady(true);
      });
  }, []);

  useEffect(() => {
    if (!groupReady) return;
    if (activeGroupId) {
      localStorage.setItem(ACTIVE_GROUP_KEY, activeGroupId);
    } else {
      localStorage.removeItem(ACTIVE_GROUP_KEY);
    }
  }, [activeGroupId, groupReady]);

  useEffect(() => {
    localStorage.setItem(RATE_KEY, String(state.playbackRate));
  }, [state.playbackRate]);

  const loadQueue = useCallback(async (
    mode: PlayerState["mode"],
    groupId?: string | null,
  ) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const reviewMode = groupId ? "shuffle" : mode;
      const params = new URLSearchParams({ mode: reviewMode });
      if (groupId) params.set("groupId", groupId);
      const response = await fetch(`/api/review-queue?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "Queue failed");
      let queue = data.queue as PlayerStateQueue;
      if (focusWord) {
        const idx = queue.findIndex((q) => q.id === focusWord);
        if (idx > 0) {
          const [item] = queue.splice(idx, 1);
          queue = [item, ...queue];
        } else if (idx === -1) {
          // word-only lesson
          const wordRes = await fetch(`/api/vocabulary/${focusWord}`);
          const wordData = await wordRes.json();
          if (wordRes.ok && wordData.entry?.content) {
            queue = [
              {
                id: wordData.entry.id,
                word: wordData.entry.word,
                pronunciation: wordData.entry.content.pronunciation,
              },
              ...queue.filter((q) => q.id !== wordData.entry.id),
            ];
          }
        }
      }
      dispatch({
        type: "SET_QUEUE",
        queue: queue.map((q) => ({
          id: q.id,
          word: q.word,
          pronunciation: q.pronunciation ?? null,
        })),
        mode: reviewMode,
      });
      setReady(true);
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Failed to load queue",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, [focusWord]);

  useEffect(() => {
    if (!groupReady) return;
    const mode = focusWord ? "all" : "shuffle";
    void loadQueue(mode, activeGroupId);
  }, [loadQueue, focusWord, activeGroupId, groupReady]);

  const loadSegments = useCallback(async (
    vocabularyId: string,
    signal?: AbortSignal,
  ) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const response = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabularyId }),
        signal,
      });
      const data = await response.json();
      if (signal?.aborted) return;
      if (!response.ok) throw new Error(data.error?.message ?? "Audio failed");
      const segments: PlayerSegment[] = (
        data.script as Array<{
          id: string;
          type: string;
          text: string;
          order: number;
          pauseAfterMs?: number;
        }>
      ).map((seg) => {
        const stored = data.lesson.segments.find(
          (s: { segmentType: string; order: number }) =>
            s.segmentType === seg.type && s.order === seg.order,
        );
        return {
          id: seg.id,
          type: seg.type,
          text: seg.text,
          order: seg.order,
          pauseAfterMs: seg.pauseAfterMs,
          audioUrl: stored?.audioUrlOrStorageKey ?? null,
        };
      });
      if (signal?.aborted) return;
      dispatch({
        type: "SET_SEGMENTS",
        segments,
        useBrowserFallback: data.useBrowserFallback,
      });
      await fetch("/api/review-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocabularyEntryId: vocabularyId,
          action: "played",
        }),
        signal,
      }).catch(() => undefined);
    } catch (error) {
      if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
        return;
      }
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Audio load failed",
      });
    } finally {
      if (!signal?.aborted) {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    }
  }, []);

  useEffect(() => {
    if (!state.currentVocabularyId) return;
    const controller = new AbortController();
    void loadSegments(state.currentVocabularyId, controller.signal);
    return () => controller.abort();
  }, [state.currentVocabularyId, state.segmentLoadKey, loadSegments]);

  const advanceSegment = useCallback(() => {
    const s = stateRef.current;
    if (s.currentSegmentIndex < s.segments.length - 1) {
      dispatch({
        type: "SET_SEGMENT_INDEX",
        index: s.currentSegmentIndex + 1,
      });
      return;
    }
    // word complete
    if (s.currentVocabularyId) {
      void fetch("/api/review-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocabularyEntryId: s.currentVocabularyId,
          action: "completed",
        }),
      });
    }
    if (s.queuePosition < s.queue.length - 1) {
      dispatch({ type: "SET_POSITION", position: s.queuePosition + 1 });
      if (s.isPlaying) dispatch({ type: "PLAY" });
    } else if (s.repeat) {
      void loadQueue(s.shuffle ? "shuffle" : s.mode, activeGroupId);
      dispatch({ type: "PLAY" });
    } else {
      dispatch({ type: "PAUSE" });
    }
  }, [loadQueue, activeGroupId]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;
  const activeGroupIndex = activeGroup
    ? groups.findIndex((g) => g.id === activeGroup.id)
    : -1;
  const hasNextGroup =
    activeGroupIndex >= 0 && activeGroupIndex < groups.length - 1;

  function goNextGroup() {
    if (!hasNextGroup) return;
    const next = groups[activeGroupIndex + 1];
    if (next) setActiveGroupId(next.id);
  }

  // Playback effect
  useEffect(() => {
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }

    if (!state.isPlaying || !state.segments.length) return;

    const segment = state.segments[state.currentSegmentIndex];
    if (!segment) return;

    const url = segment.audioUrl;
    const useFile = url && !url.startsWith("browser:");

    if (useFile && audio) {
      audio.src = url;
      audio.playbackRate = state.playbackRate;
      void audio.play().catch(() => {
        // fallback to browser speech
        cancelSpeakRef.current = speakBrowser(
          segment.text,
          state.playbackRate,
          advanceSegment,
          (message) => dispatch({ type: "SET_ERROR", error: message }),
        );
      });
      return;
    }

    cancelSpeakRef.current = speakBrowser(
      segment.text,
      state.playbackRate,
      advanceSegment,
      (message) => dispatch({ type: "SET_ERROR", error: message }),
    );

    return () => {
      cancelSpeakRef.current?.();
    };
  }, [
    state.isPlaying,
    state.currentSegmentIndex,
    state.segments,
    state.playbackRate,
    advanceSegment,
  ]);

  useEffect(() => {
    const active = document.getElementById(
      `segment-${state.currentSegmentIndex}`,
    );
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.currentSegmentIndex]);

  const current = state.queue[state.queuePosition];

  function goPrev() {
    if (state.queuePosition > 0) {
      dispatch({ type: "SET_POSITION", position: state.queuePosition - 1 });
    } else {
      dispatch({ type: "SET_SEGMENT_INDEX", index: 0 });
    }
  }

  function goNext() {
    if (state.queuePosition < state.queue.length - 1) {
      dispatch({ type: "SET_POSITION", position: state.queuePosition + 1 });
    }
  }

  function cycleRate() {
    const idx = PLAYBACK_RATES.indexOf(
      state.playbackRate as (typeof PLAYBACK_RATES)[number],
    );
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    dispatch({ type: "SET_RATE", rate: next });
  }

  async function toggleShuffle() {
    if (activeGroupId) return;
    const next = state.mode !== "shuffle";
    dispatch({ type: "SET_SHUFFLE", shuffle: next });
    await loadQueue(next ? "shuffle" : "all", null);
  }

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <header className="flex items-center justify-between gap-3 pb-4">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] font-[family-name:var(--font-ui)] text-sm"
          aria-label="Back to dashboard"
        >
          ←
        </Link>
        <div className="text-center font-[family-name:var(--font-ui)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
            {activeGroup
              ? `${activeGroup.name} · shuffle`
              : state.mode === "shuffle"
                ? "Shuffle"
                : state.mode}{" "}
            review
          </p>
          <p className="text-sm text-[var(--ink)]">
            {state.queue.length
              ? `${state.queuePosition + 1} / ${state.queue.length}`
              : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadQueue(state.mode, activeGroupId)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] font-[family-name:var(--font-ui)] text-xs"
          aria-label="Reload queue"
        >
          ↻
        </button>
      </header>

      {groups.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 font-[family-name:var(--font-ui)]">
          <label htmlFor="active-group" className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">
            Study group
          </label>
          <select
            id="active-group"
            value={activeGroupId ?? ""}
            onChange={(e) => setActiveGroupId(e.target.value || null)}
            className="min-h-10 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm sm:max-w-xs"
          >
            <option value="">All groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!hasNextGroup}
            onClick={goNextGroup}
            className="min-h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm disabled:opacity-50"
          >
            Next group
          </button>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col items-center px-1 pb-36 pt-6 text-center">
        {!groupReady || (!ready && state.loading) ? (
          <p className="font-[family-name:var(--font-ui)] text-[var(--ink-muted)]">
            Preparing your queue…
          </p>
        ) : null}
        {groupReady && !state.queue.length && !state.loading ? (
          <div className="max-w-sm space-y-3">
            <p className="font-[family-name:var(--font-display)] text-2xl">
              No words ready yet
            </p>
            <p className="text-[var(--ink-muted)]">
              {activeGroup
                ? `No ready words in “${activeGroup.name}”. Switch to All groups, or import cards into this group.`
                : "Add a few GRE words from the dashboard, then start an audio review."}
            </p>
            <Link
              href={activeGroup ? "/library" : "/"}
              className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)]"
            >
              {activeGroup ? "Open library" : "Add words"}
            </Link>
          </div>
        ) : null}

        {current ? (
          <>
            <p className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Now teaching
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight sm:text-6xl">
              {current.word}
            </h1>
            {current.pronunciation?.simple ? (
              <p className="mt-3 font-[family-name:var(--font-ui)] text-[var(--ink-muted)]">
                {current.pronunciation.simple}
              </p>
            ) : null}

            {state.loading && !state.segments.length ? (
              <p className="mt-8 font-[family-name:var(--font-ui)] text-[var(--ink-muted)]">
                Loading lesson…
              </p>
            ) : null}

            <div
              className="mt-8 w-full max-w-lg space-y-2 text-left"
              aria-live="polite"
            >
              {state.segments.map((segment, index) => {
                const active = index === state.currentSegmentIndex;
                return (
                  <div
                    id={`segment-${index}`}
                    key={segment.id}
                    className={`rounded-xl border px-4 py-3 transition ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow)]"
                        : "border-transparent bg-[var(--surface-muted)] text-[var(--ink-muted)]"
                    }`}
                  >
                    <p className="font-[family-name:var(--font-ui)] text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                      {segment.type.replace("_", " ")}
                    </p>
                    <p className={`mt-1 leading-relaxed ${active ? "text-[var(--ink)]" : ""}`}>
                      {segment.text}
                    </p>
                  </div>
                );
              })}
            </div>
            {state.useBrowserFallback ? (
              <p className="mt-4 font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
                Development speech: browser synthesis (set TTS_PROVIDER=openai for cached MP3s)
              </p>
            ) : null}
          </>
        ) : null}

        {state.error ? (
          <p className="mt-4 font-[family-name:var(--font-ui)] text-sm text-[var(--danger)]" role="alert">
            {state.error}{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                dispatch({ type: "SET_ERROR", error: null });
                if (state.currentVocabularyId) {
                  void loadSegments(state.currentVocabularyId);
                }
              }}
            >
              Retry
            </button>
            {" · "}
            <button type="button" className="underline" onClick={advanceSegment}>
              Skip
            </button>
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--line)] bg-[var(--paper-elevated)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="h-1 overflow-hidden rounded-full bg-[var(--overlay)]">
            <div
              className="h-full bg-[var(--accent)] transition-all"
              style={{
                width: state.segments.length
                  ? `${((state.currentSegmentIndex + 1) / state.segments.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] font-[family-name:var(--font-ui)] text-lg"
              aria-label="Previous word"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: state.isPlaying ? "PAUSE" : "PLAY" })
              }
              disabled={!state.segments.length}
              className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--accent)] font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
              aria-label={state.isPlaying ? "Pause" : "Play"}
            >
              {state.isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] font-[family-name:var(--font-ui)] text-lg"
              aria-label="Next word"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => void toggleShuffle()}
              disabled={Boolean(activeGroupId)}
              className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border font-[family-name:var(--font-ui)] text-xs ${
                state.mode === "shuffle" || activeGroupId
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              } disabled:opacity-50`}
              aria-pressed={state.mode === "shuffle" || Boolean(activeGroupId)}
              aria-label={
                activeGroupId
                  ? "Shuffle locked to active group"
                  : state.mode === "shuffle"
                    ? "Turn off shuffle"
                    : "Turn on shuffle"
              }
            >
              Shuffle
            </button>
            <button
              type="button"
              onClick={cycleRate}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] font-[family-name:var(--font-ui)] text-xs font-medium"
              aria-label={`Playback speed ${state.playbackRate}x`}
            >
              {state.playbackRate}x
            </button>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={advanceSegment}
        onError={() =>
          dispatch({
            type: "SET_ERROR",
            error: "Audio segment failed to play.",
          })
        }
        className="hidden"
      />
    </div>
  );
}

type PlayerStateQueue = Array<{
  id: string;
  word: string;
  pronunciation?: { simple?: string | null; ipa?: string | null } | null;
}>;
