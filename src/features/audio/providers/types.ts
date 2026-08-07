export type GeneratedSpeech = {
  audioBytes: Uint8Array | null;
  contentType: string;
  durationMs: number | null;
  /** When true, client should use browser SpeechSynthesis */
  useBrowserFallback: boolean;
};

export interface TextToSpeechProvider {
  generateSpeech(input: {
    text: string;
    voice?: string;
    segmentKey: string;
  }): Promise<GeneratedSpeech>;
  readonly name: string;
}
