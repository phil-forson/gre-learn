"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerSegment } from "@/features/learning/types";
import { PLAYBACK_RATES } from "@/features/audio/player/state";
import {
  speakBrowser,
  warmBrowserVoice,
} from "@/features/audio/player/browser-tts";

const RATE_KEY = "gre-learn-playback-rate";

type Props = {
  unitId: string;
  onPlayed?: () => void;
};

export function GrammarAudioPlayer({ unitId, onPlayed }: Props) {
  const [segments, setSegments] = useState<PlayerSegment[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBrowserFallback, setUseBrowserFallback] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelSpeakRef = useRef<(() => void) | null>(null);
  const browserVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recordedPlayRef = useRef(false);
  const indexRef = useRef(index);
  const segmentsRef = useRef(segments);
  indexRef.current = index;
  segmentsRef.current = segments;

  const signalPlay = useCallback(() => {
    if (recordedPlayRef.current) return;
    recordedPlayRef.current = true;
    void fetch(`/api/grammar/units/${unitId}/play`, { method: "POST" })
      .then((res) => {
        if (res.ok) onPlayed?.();
      })
      .catch(() => undefined);
  }, [unitId, onPlayed]);

  useEffect(() => {
    const saved = localStorage.getItem(RATE_KEY);
    if (saved) {
      const rate = Number(saved);
      if (PLAYBACK_RATES.includes(rate as (typeof PLAYBACK_RATES)[number])) {
        setPlaybackRate(rate);
      }
    }
    void warmBrowserVoice().then((voice) => {
      browserVoiceRef.current = voice;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(RATE_KEY, String(playbackRate));
  }, [playbackRate]);

  const loadLesson = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlaying(false);
    try {
      const response = await fetch("/api/grammar/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message ?? "Audio failed");
      }
      const next: PlayerSegment[] = (
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
      setSegments(next);
      setIndex(0);
      setUseBrowserFallback(Boolean(data.useBrowserFallback));
      recordedPlayRef.current = false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audio load failed");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  const advanceSegment = useCallback(() => {
    const segs = segmentsRef.current;
    const current = indexRef.current;
    if (current < segs.length - 1) {
      setIndex(current + 1);
      return;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }

    if (!playing || !segments.length) return;
    const segment = segments[index];
    if (!segment) return;

    const url = segment.audioUrl;
    const useFile = url && !url.startsWith("browser:");

    if (useFile && audio) {
      audio.src = url;
      audio.playbackRate = playbackRate;
      void audio.play().catch(() => {
        cancelSpeakRef.current = speakBrowser(
          segment.text,
          playbackRate,
          advanceSegment,
          (message) => setError(message),
          browserVoiceRef.current,
        );
      });
      return;
    }

    cancelSpeakRef.current = speakBrowser(
      segment.text,
      playbackRate,
      advanceSegment,
      (message) => setError(message),
      browserVoiceRef.current,
    );

    return () => {
      cancelSpeakRef.current?.();
    };
  }, [playing, index, segments, playbackRate, advanceSegment]);

  useEffect(() => {
    const active = document.getElementById(`grammar-segment-${index}`);
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [index]);

  function cycleRate() {
    const idx = PLAYBACK_RATES.indexOf(
      playbackRate as (typeof PLAYBACK_RATES)[number],
    );
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(next);
  }

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => advanceSegment()}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading || !segments.length}
          onClick={() => {
            setPlaying((p) => {
              const next = !p;
              if (next) signalPlay();
              return next;
            });
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
        >
          {playing ? "Pause" : "Play lesson"}
        </button>
        <button
          type="button"
          onClick={cycleRate}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 font-[family-name:var(--font-ui)] text-sm"
        >
          {playbackRate}×
        </button>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setPlaying(true);
            signalPlay();
          }}
          disabled={!segments.length}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] px-3 font-[family-name:var(--font-ui)] text-sm disabled:opacity-50"
        >
          Restart
        </button>
        {useBrowserFallback ? (
          <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--ink-muted)]">
            Browser speech
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ink-muted)]">Preparing audio…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-[var(--danger, #b42318)]" role="alert">
          {error}
        </p>
      ) : null}

      <ol className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
        {segments.map((segment, i) => (
          <li
            key={segment.id}
            id={`grammar-segment-${i}`}
            className={`rounded-lg px-3 py-2 font-[family-name:var(--font-ui)] text-sm transition-colors ${
              i === index
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--ink-muted)]"
            }`}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => {
                setIndex(i);
                setPlaying(true);
                signalPlay();
              }}
            >
              {segment.text}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
