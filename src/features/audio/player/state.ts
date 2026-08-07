export type PlayerState = {
  queue: Array<{
    id: string;
    word: string;
    pronunciation: { simple?: string | null; ipa?: string | null } | null;
  }>;
  queuePosition: number;
  currentVocabularyId: string | null;
  currentSegmentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: boolean;
  playbackRate: number;
  volume: number;
  mode: "all" | "shuffle" | "recent" | "favorites";
  segments: Array<{
    id: string;
    type: string;
    text: string;
    order: number;
    audioUrl: string | null;
  }>;
  useBrowserFallback: boolean;
  error: string | null;
  loading: boolean;
};

export type PlayerAction =
  | { type: "SET_QUEUE"; queue: PlayerState["queue"]; mode: PlayerState["mode"] }
  | { type: "SET_POSITION"; position: number }
  | { type: "SET_SEGMENTS"; segments: PlayerState["segments"]; useBrowserFallback: boolean }
  | { type: "SET_SEGMENT_INDEX"; index: number }
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
  currentSegmentIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: false,
  playbackRate: 1,
  volume: 1,
  mode: "all",
  segments: [],
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
        queuePosition: 0,
        currentVocabularyId: action.queue[0]?.id ?? null,
        currentSegmentIndex: 0,
        segments: [],
      };
    case "SET_POSITION":
      return {
        ...state,
        queuePosition: action.position,
        currentVocabularyId: state.queue[action.position]?.id ?? null,
        currentSegmentIndex: 0,
        segments: [],
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
