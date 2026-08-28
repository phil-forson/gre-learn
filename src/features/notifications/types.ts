export const DIGEST_BRAND = "Today's English" as const;

export type NotificationPreferences = {
  id: string;
  userId: string;
  enabled: boolean;
  timezone: string;
  sendHourLocal: number;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  includeGrammar: boolean;
  includeVocab: boolean;
  includePiano: boolean;
  skipEmptyDays: boolean;
  /** Local calendar day YYYY-MM-DD when digest was last sent. */
  lastDigestSentOn: string | null;
  dateCreated: string;
  dateUpdated: string;
};

export type PushDeviceToken = {
  id: string;
  userId: string;
  token: string;
  platform: "web";
  userAgent: string | null;
  dateCreated: string;
  dateUpdated: string;
};

export type DigestVocabSnippet = {
  word: string;
  definition: string;
};

export type DigestGrammarSnippet = {
  unitId: string;
  title: string;
  ruleLine?: string;
};

export type DigestPianoSnippet = {
  label: string;
  href: string;
};

export type DigestPayload = {
  title: typeof DIGEST_BRAND;
  body: string;
  /** In-app path only (must start with `/`). */
  url: string;
  kind: "active" | "continue" | "placement";
  localDay: string;
  grammarCount: number;
  vocabNewCount: number;
  vocabReviewedCount: number;
  pianoCount?: number;
};

export type DigestBuildInput = {
  prefs: NotificationPreferences;
  now: Date;
  grammar: DigestGrammarSnippet[];
  vocabNew: DigestVocabSnippet[];
  vocabReviewed: DigestVocabSnippet[];
  piano?: DigestPianoSnippet[];
  continueTarget: {
    href: string;
    label: string;
    needsPlacement: boolean;
  };
};
