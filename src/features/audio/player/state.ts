import type { PlayerSegment, ReviewMode } from "@/features/learning/types";
import {
  defaultNarrationFields,
  type NarrationFieldsPrefs,
} from "./narration-fields";

export type PlayerQueueItem = {
  id: string;
  word: string;
  isFavorite: boolean;
  pronunciation: { simple?: string | null; ipa?: string | null } | null;
};

export type PlayerState = {
  queue: PlayerQueueItem[];
  queuePosition: number;
  currentVocabularyId: string | null;
  /** Bumps whenever segments must be re-fetched (even if vocabulary id is unchanged). */
  segmentLoadKey: number;
  currentSegmentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: boolean;
  playbackRate: number;
  volume: number;
  mode: ReviewMode;
  /** Full lesson segments from generate — filter at play time via narrationFields. */
  segments: PlayerSegment[];
  narrationFields: NarrationFieldsPrefs;
  useBrowserFallback: boolean;
  error: string | null;
  loading: boolean;
};

export type PlayerAction =
  | { type: "SET_QUEUE"; queue: PlayerState["queue"]; mode: PlayerState["mode"] }
  | { type: "SET_POSITION"; position: number }
  | { type: "SET_SEGMENTS"; segments: PlayerState["segments"]; useBrowserFallback: boolean }
  | { type: "SET_SEGMENT_INDEX"; index: number }
  | { type: "SET_NARRATION_FIELDS"; fields: NarrationFieldsPrefs }
  | { type: "SET_FAVORITE"; id: string; isFavorite: boolean }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SET_RATE"; rate: number }
  | { type: "SET_SHUFFLE"; shuffle: boolean }
  | { type: "SET_REPEAT"; repeat: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "RESET_WORD" };

export const initialPlayerState: PlayerState = {
  queue: [],
  queuePosition: 0,
  currentVocabularyId: null,
  segmentLoadKey: 0,
  currentSegmentIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: false,
  playbackRate: 1,
  volume: 1,
  mode: "all",
  segments: [],
  narrationFields: defaultNarrationFields(),
  useBrowserFallback: true,
  error: null,
  loading: false,
};

export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case "SET_QUEUE":
      return {
        ...state,
        queue: action.queue,
        mode: action.mode,
        shuffle: action.mode === "shuffle",
        queuePosition: 0,
        currentVocabularyId: action.queue[0]?.id ?? null,
        segmentLoadKey: state.segmentLoadKey + 1,
        currentSegmentIndex: 0,
        segments: [],
        error: null,
      };
    case "SET_POSITION":
      return {
        ...state,
        queuePosition: action.position,
        currentVocabularyId: state.queue[action.position]?.id ?? null,
        segmentLoadKey: state.segmentLoadKey + 1,
        currentSegmentIndex: 0,
        segments: [],
        error: null,
      };
    case "SET_SEGMENTS":
      return {
        ...state,
        segments: action.segments,
        useBrowserFallback: action.useBrowserFallback,
        currentSegmentIndex: 0,
      };
    case "SET_SEGMENT_INDEX":
      return { ...state, currentSegmentIndex: action.index };
    case "SET_NARRATION_FIELDS":
      return {
        ...state,
        narrationFields: action.fields,
        currentSegmentIndex: 0,
      };
    case "SET_FAVORITE":
      return {
        ...state,
        queue: state.queue.map((item) =>
          item.id === action.id
            ? { ...item, isFavorite: action.isFavorite }
            : item,
        ),
      };
    case "PLAY":
      return { ...state, isPlaying: true };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "SET_RATE":
      return { ...state, playbackRate: action.rate };
    case "SET_SHUFFLE":
      return { ...state, shuffle: action.shuffle };
    case "SET_REPEAT":
      return { ...state, repeat: action.repeat };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "RESET_WORD":
      return { ...state, currentSegmentIndex: 0, segments: [] };
    default:
      return state;
  }
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
