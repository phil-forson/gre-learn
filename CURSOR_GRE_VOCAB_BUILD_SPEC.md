# Cursor Build Spec — GRE Audio Vocabulary Platform

## Mission

Build a polished, mobile-first GRE vocabulary web application that turns words I encounter while studying into a **personal vocabulary podcast**.

The core loop is:

**Add word once → automatically enrich it → persist it → generate reusable audio lesson segments → continuously review saved words with synchronized transcript highlighting.**

This is primarily a personal GRE-prep MVP with an exam timeline of roughly six weeks. Prioritize a reliable, delightful core experience over enterprise complexity, but keep the architecture clean enough to support multiple users later.

Do not stop at architecture, mockups, TODOs, or implementation plans. **Implement the application in the repository, run it, test it, and leave it in a runnable state.**

---

# 1. Product Priorities

## P0 — Must Work

1. Add a vocabulary word quickly.
2. Normalize and deduplicate the word.
3. Generate structured GRE learning content.
4. Validate generated content before persistence.
5. Persist vocabulary in PostgreSQL.
6. Browse/search the vocabulary library.
7. Open a detailed learning card.
8. Generate a deterministic audio lesson script from saved content.
9. Narrate lesson segments.
10. Play segments sequentially.
11. Automatically move from one word to the next.
12. Shuffle a review queue.
13. Show the same lesson text being narrated.
14. Highlight the active audio segment.
15. Work excellently on mobile.
16. Handle generation/audio/database failures gracefully.

## P1 — Important

- Batch add
- Favorites
- Playback speed
- Review history
- Regenerate content
- Dashboard statistics
- Audio caching and stale-content invalidation
- Search/filter/sort
- Personal notes

## P2 — Only After P0/P1 Are Stable

- Dark mode
- Media Session API
- PWA installation
- “I know this” / “Review more”
- Advanced filters
- Export

Do not allow P2 work to delay P0.

---

# 2. Default Technical Stack

Unless an existing repository already dictates a compatible stack, use:

- **Next.js** with App Router
- **React**
- **TypeScript** with strict mode
- **Tailwind CSS**
- **PostgreSQL**
- **Drizzle ORM** or Prisma; prefer Drizzle unless the repository already uses Prisma
- **Zod** for all external/generated-data validation
- Server-side provider calls only
- **Vitest** for unit/integration tests
- **Playwright** for a small golden-path E2E suite

Use current stable, mutually compatible versions available in the environment. Do not pin arbitrary outdated versions.

Keep dependencies minimal.

---

# 3. Required Project Structure

Prefer domain-oriented organization similar to:

```text
app/
  page.tsx
  library/
  words/[id]/
  audio/
  favorites/
  settings/
  api/                  # only where route handlers are appropriate

components/
  ui/
  navigation/

features/
  vocabulary/
    components/
    schemas/
    services/
    repository/
  generation/
    providers/
    prompts/
  audio/
    components/
    services/
    providers/
    player/
  review/
    services/
    state/

lib/
  db/
  env/
  errors/
  logging/
  utils/

tests/
  unit/
  integration/
  e2e/

scripts/
  seed.ts
```

Do not put business logic inside giant React components.

---

# 4. Core Domain Model

Use a pragmatic relational model. JSON columns are acceptable for secondary generated structures when they simplify the MVP, but query-heavy fields should be first-class columns.

At minimum support these concepts:

## User

Even if authentication is omitted in the first local MVP, vocabulary rows must still belong to a user-compatible identity so multi-user support can be added later without redesigning the database.

For local development, a single seeded/default user is acceptable.

## VocabularyEntry

Suggested fields:

```text
id
userId
word
normalizedWord
partOfSpeech
status
isFavorite
dateAdded
dateUpdated
lastReviewedAt
reviewCount
contentVersion
contentHash
generationProvider
generationModel
generationError
audioStatus
audioError
personalNote
```

Create a unique constraint/index on:

```text
(userId, normalizedWord)
```

Also index:

- dateAdded
- status
- isFavorite
- lastReviewedAt

## Generated Learning Content

Store validated content representing:

- pronunciation
- definitions
- etymology
- memory hook
- synonyms
- antonyms
- example sentences
- word family
- usage notes
- confused-with words

These may be normalized tables or a validated JSON document attached to `VocabularyEntry`. For the MVP, a well-typed JSON document is acceptable if it reduces complexity.

## AudioLesson

Represents narration derived from a specific vocabulary content version/hash.

## AudioSegment

Required fields conceptually include:

```text
id
audioLessonId
vocabularyEntryId
segmentKey
segmentType
order
text
audioUrlOrStorageKey
durationMs
contentHash
status
error
```

## ReviewEvent

At minimum support:

```text
id
userId
vocabularyEntryId
playedAt
action
```

Actions may include:

- played
- completed
- know_it
- review_more

Only `played/completed` are required for the initial MVP.

---

# 5. Word Normalization

Create a dedicated, independently tested normalization function.

Rules:

1. Trim leading/trailing whitespace.
2. Normalize Unicode using a consistent normalization form.
3. Normalize comparison casing to lowercase.
4. Remove accidental surrounding punctuation.
5. Preserve legitimate internal apostrophes/hyphens where appropriate.
6. Reject blank input.
7. Reject obviously invalid multi-paragraph or sentence-like input in single-word mode.
8. Do not create duplicate vocabulary entries for equivalent normalized forms.

Example:

```text
"Laconic"
" laconic "
"LACONIC"
```

must resolve to the same `normalizedWord`.

---

# 6. Vocabulary Generation Schema

All AI-generated vocabulary content must be structured and validated with Zod before database insertion.

Use a schema equivalent to:

```ts
type VocabularyLearningContent = {
  word: string;
  normalizedWord: string;

  partOfSpeech: string[];

  pronunciation: {
    ipa?: string | null;
    simple?: string | null;
    confidence?: "high" | "medium" | "low";
  };

  definitions: Array<{
    text: string;
    sense?: string;
    isPrimary: boolean;
  }>;

  etymology: {
    summary: string;
    isUsefulForRootLearning: boolean;
    uncertaintyNote?: string | null;
    components: Array<{
      text: string;
      type: "prefix" | "root" | "stem" | "suffix" | "other";
      origin?: string | null;
      meaning: string;
      explanation: string;
      relatedWords: string[];
      confidence: "high" | "medium" | "low";
    }>;
  };

  memoryHook: {
    text: string;
    type: "visual" | "sound" | "story" | "wordplay" | "other";
  };

  synonyms: Array<{
    word: string;
    note?: string | null;
  }>;

  antonyms: string[];

  exampleSentences: Array<{
    text: string;
    targetSense?: string | null;
  }>;

  wordFamily: string[];

  usageNotes?: string | null;

  confusedWith: Array<{
    word: string;
    distinction?: string | null;
  }>;
};
```

Validation rules should enforce at minimum:

- non-empty normalized word
- at least one definition
- exactly one primary definition if possible
- non-empty memory hook
- at least one example sentence
- sensible bounded array sizes
- valid confidence enums
- no malformed nested objects

If output fails validation:

1. retry with a repair/correction prompt,
2. validate again,
3. log a safe developer error,
4. mark generation as failed if necessary,
5. never insert corrupted generated content,
6. never show raw provider stack traces or secrets to the user.

Use a small, bounded retry count. Never loop indefinitely.

---

# 7. Non-Negotiable Etymology Rules

This is pedagogically critical.

**Never fabricate etymology or roots.**

The product must make a visual and conceptual distinction between:

- **ROOT / ORIGIN** — factual linguistic information
- **MEMORY HOOK** — deliberately invented mnemonic

Generation rules:

1. Do not split a word just because a substring resembles a familiar Greek/Latin root.
2. Distinguish historical etymology from modern morphology.
3. Prefer “not usefully decomposable for GRE root learning” over a fake decomposition.
4. Express uncertainty explicitly.
5. Do not state uncertain IPA or etymology with false confidence.
6. Related-root words must actually be linguistically defensible.
7. Mnemonics may be playful or invented, but must never be presented as factual origin.

The detail UI must use explicit headings:

```text
ROOT / ORIGIN
MEMORY HOOK
```

Never label the mnemonic as a root.

---

# 8. Production Vocabulary Prompt

Create a reusable server-side prompt approximately following this intent:

```text
You are an expert English lexicographer, etymology researcher,
GRE vocabulary instructor, and memory-learning specialist.

Analyze the supplied English vocabulary word for a GRE learner.

Return only data conforming to the required structured schema.

Priorities, in order:
1. semantic accuracy
2. etymological accuracy
3. GRE usefulness
4. memorability
5. concision

Rules:
- Prefer the dominant GRE-relevant definition.
- Use clear language.
- Never fabricate etymology.
- Never split a word solely because its spelling resembles a known root.
- Distinguish factual etymology from mnemonic wordplay.
- If root decomposition is not educationally useful, say so clearly.
- When etymology is uncertain, communicate uncertainty.
- Do not present unsupported IPA as unquestionably authoritative.
- Create one short vivid mnemonic.
- Provide close, useful GRE-style synonyms, preserving nuance.
- Provide at least one natural example sentence whose context makes the
  target meaning inferable.
- Do not include unsupported facts with false confidence.
- Return structured data only.
```

Strengthen this prompt as needed, but preserve these constraints.

---

# 9. Provider Architecture

Do not couple the application to one AI or TTS vendor.

Create interfaces similar to:

```ts
interface VocabularyGenerationProvider {
  generate(word: string): Promise<VocabularyLearningContent>;
}
```

```ts
interface TextToSpeechProvider {
  generateSpeech(input: {
    text: string;
    voice?: string;
    segmentKey: string;
  }): Promise<GeneratedSpeech>;
}
```

Provider selection must come from server-side environment configuration.

Never expose secret API keys to the browser.

If an external provider is not configured, show a developer-friendly message describing the missing environment variable.

For development, support mock/seed content so the UI can be tested without paid API calls.

For TTS, a browser SpeechSynthesis fallback is acceptable for local development, but keep it clearly separated from production-quality cached server-generated audio.

---

# 10. Word Add Flow

The Dashboard must make adding a word extremely fast.

Primary interaction:

```text
[ Add a word you just encountered... ] [Add]
```

Requirements:

- autofocus where reasonable
- Enter submits
- immediate visible acknowledgment
- input clears after successful queueing
- no full-screen blocking loader
- user can continue studying/adding
- processing status appears immediately
- duplicate creates no new row
- duplicate response offers “Open word”
- invalid input gives friendly validation feedback

Suggested statuses:

```text
pending
generating
ready
generation_failed
audio_pending
audio_ready
audio_failed
```

Generation may be synchronous for the first implementation if necessary, but service boundaries must make a future durable job queue possible.

Do not use a fragile in-memory-only async job system as if it were durable.

---

# 11. Batch Add

Add an optional batch mode that accepts newline/comma-separated entries such as:

```text
laconic
obdurate
pellucid
parsimonious
intransigent
```

The batch service must:

- normalize entries
- remove duplicates within the submitted batch
- skip existing words
- process each item independently
- show per-item state
- continue if one item fails
- report successes/failures clearly

---

# 12. Learning Card UX

The word detail page should prioritize information in this order:

1. **WORD**
2. Pronunciation
3. Part of speech
4. Definition
5. **ROOT / ORIGIN**
6. **MEMORY HOOK**
7. Synonyms
8. Example sentence
9. Expandable secondary content

Secondary content:

- antonyms
- word family
- usage notes
- confused-with words
- personal note

Actions:

- play word lesson
- favorite
- regenerate
- edit personal note
- delete with confirmation

Generated content should not require deleting the vocabulary row to regenerate.

---

# 13. Library

Create a dedicated Library page.

At minimum support:

- search by word
- alphabetical sort
- newest first
- oldest first
- favorites filter
- status filter

Each row/card shows:

- word
- concise primary definition
- part of speech
- readiness/status
- favorite state

Do not render thousands of rows at once. Use server-side pagination or another scalable loading strategy.

---

# 14. Deterministic Audio Lesson Script

Audio narration must be generated **from the saved structured learning card**, not independently from another AI response.

Create an `AudioLessonScript` builder.

Example:

```ts
type AudioLessonSegment = {
  id: string;
  type:
    | "word"
    | "spelling"
    | "pronunciation"
    | "definition"
    | "etymology"
    | "memory_hook"
    | "synonyms"
    | "example";
  text: string;
  order: number;
  pauseAfterMs?: number;
};
```

Default order:

1. word
2. spelling
3. pronunciation
4. definition
5. root/origin
6. memory hook
7. synonyms
8. example sentence

Example narration:

```text
Obdurate.

O. B. D. U. R. A. T. E.

Pronounced: OB-duh-rut.

Obdurate means stubbornly refusing to change one's opinion or course of action.

Root and origin: ...

Memory hook: ...

Synonyms include stubborn, unyielding, and intransigent.

Example: Despite hours of negotiation, the obdurate official refused to reconsider the decision.
```

Keep narration useful and concise, not robotic or essay-like.

Spelling must deliberately separate letters for TTS.

The transcript displayed in the player must come from this exact same script object.

---

# 15. Audio Segmentation and Synchronization

Do **not** make the MVP depend on word-level speech timestamps.

Generate/play logical lesson segments independently:

- word
- spelling
- pronunciation
- definition
- etymology
- mnemonic
- synonyms
- example

This guarantees reliable synchronization.

For each segment store:

- segment ID
- vocabulary ID
- order
- text
- audio storage key or URL
- duration if known
- content hash/version
- status

The player highlights the active segment.

When a segment ends:

1. advance to the next segment,
2. update active transcript highlight,
3. continue automatically.

When the final segment of a word ends:

1. record review completion,
2. advance to the next word in the queue,
3. start its first segment automatically.

Auto-scroll only when necessary. Keep the active segment near the central viewport without irritating continuous scrolling.

---

# 16. Audio Caching and Versioning

Never call TTS every time Play is pressed.

Compute a stable hash from data that affects narration, including:

- vocabulary content version/hash
- segment type
- segment text
- selected voice
- relevant TTS settings

Reuse cached audio for matching hashes.

If narration-affecting vocabulary content changes:

1. increment/update content version/hash,
2. mark old audio stale,
3. generate new segments as needed.

Do **not** invalidate audio because of unrelated metadata such as favoriting a word or updating review count.

Playback speed must be handled by the audio player, not by generating separate files for every playback rate.

---

# 17. Audio Review Modes

At minimum implement:

- **All Words**
- **Shuffle**
- **Recently Added**
- **Favorites**

Only ready/eligible words should enter the queue.

Shuffle requirements:

- no duplicates inside a queue
- avoid immediately replaying the current item
- randomize all eligible entries
- continue until queue exhaustion

Keep shuffle/review queue generation in a pure, independently testable service.

Future weighting by age/difficulty/review count should be possible without rewriting the player.

---

# 18. Player State

Use a coherent player state model, reducer, or small state store.

Track:

```text
queue
queuePosition
currentVocabularyId
currentSegmentIndex
currentSegmentTime
isPlaying
shuffle
repeat
playbackRate
volume
error
```

Do not implement the player as a fragile collection of unrelated component state variables.

Remember harmless UI preferences such as playback rate in localStorage.

Required speeds:

```text
0.75x
1x
1.25x
1.5x
2x
```

---

# 19. Player UX

Mobile-first layout:

Top:

- back/navigation
- review mode
- queue progress, e.g. `12 / 84`

Center:

- large vocabulary word
- pronunciation
- synchronized transcript card

Bottom fixed controls:

- previous word
- play/pause
- next word
- shuffle
- speed

Also show current lesson progress.

Controls must have accessible labels and large touch targets.

No important interaction may depend on hover.

If a segment fails:

- show a subtle error
- allow retry
- allow skip
- do not crash the queue

If an entire word has no server-generated audio, either skip it or use the clearly labeled development speech fallback.

---

# 20. Continuous Playback

This is central to the product.

The user must be able to press Play once and listen hands-free across the review queue.

At the end of each word:

- automatically move to the next word

At the end of the queue:

- stop by default
- optionally repeat/reshuffle when repeat mode is enabled

Do not generate one giant audio file for the full library.

Use reusable per-word/per-segment audio.

---

# 21. Dashboard

Keep the Dashboard focused.

Include:

- rapid Add Word input
- Start Audio Review button
- recent vocabulary
- lightweight statistics

Statistics:

- words saved
- added this week
- reviewed today
- favorites

Do not turn the product into gamification.

---

# 22. Favorites and Review History

Favorites should be a simple boolean on vocabulary entries unless a separate relation is justified.

At minimum track:

- date added
- last played/reviewed time
- review count

A completed word lesson should update review history.

Future spaced repetition should be possible, but do not implement a full SRS engine now.

---

# 23. Settings

Create a Settings page with:

- configured AI provider status
- configured TTS provider status
- preferred TTS voice
- playback speed
- shuffle default
- theme if implemented
- optional pause-between-words setting

Never expose actual API keys in client-rendered code.

---

# 24. API / Server Operations

Use framework-conventional route handlers/server actions while keeping domain logic independent.

Support operations equivalent to:

```text
POST   /vocabulary
POST   /vocabulary/batch
GET    /vocabulary
GET    /vocabulary/:id
DELETE /vocabulary/:id
POST   /vocabulary/:id/regenerate

GET    /review-queue
POST   /review-events

POST   /audio/generate
```

Every server input must be validated.

Do not trust client-provided user IDs for authorization.

---

# 25. Security

Follow standard security practices:

- validate all server inputs
- keep provider secrets server-side
- scope vocabulary queries to the authenticated/default user
- use parameterized ORM access
- avoid mass assignment
- sanitize/escape user-editable content appropriately
- rate-limit expensive generation endpoints where practical
- never expose raw provider errors in production
- never log secrets

If Supabase is used, configure row-level security correctly.

Do not write custom password cryptography.

---

# 26. Error UX

Explicitly handle:

- AI provider unavailable
- missing AI configuration
- malformed AI result
- unsupported/invalid word
- database error
- network error
- TTS provider unavailable
- audio generation failure
- audio segment playback failure

A vocabulary card that generated successfully must remain saved even if TTS fails.

Use retry actions where appropriate.

Never expose stack traces to normal users.

---

# 27. Seed Data

Provide a development seed script with roughly 8–15 GRE words.

Include a mixture of:

- useful Latin/Greek roots
- words that should **not** be force-split
- nouns
- verbs
- adjectives
- varied synonym relationships

Example candidates:

```text
laconic
obdurate
pellucid
parsimonious
intransigent
equivocate
magnanimous
prosaic
recalcitrant
sagacious
enervate
ephemeral
```

Seed content must be clearly marked as development/demo data.

The UI should be testable without paid AI/TTS calls.

---

# 28. Environment Variables

Create `.env.example`.

Use names matching the actual implementation. Conceptually:

```dotenv
DATABASE_URL=

AI_PROVIDER=
AI_API_KEY=
AI_MODEL=

TTS_PROVIDER=
TTS_API_KEY=
TTS_VOICE=

AUDIO_STORAGE_DRIVER=
AUDIO_STORAGE_BUCKET=
AUDIO_STORAGE_PATH=
```

Never commit real secrets.

Validate environment configuration at server startup or first provider use with clear messages.

---

# 29. Storage

For local development, a simple filesystem-backed generated-audio storage adapter is acceptable if the framework/runtime supports it reliably.

For production, architecture should support object storage.

Create a storage abstraction rather than scattering filesystem/object-storage logic throughout components.

Do not fetch or preload audio for the entire vocabulary library.

Generate/load only what is needed.

---

# 30. Accessibility

Required:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- screen-reader labels
- buttons with accessible names
- reduced-motion awareness
- no hover-only critical controls

The Audio Review page must be usable without a mouse.

---

# 31. Performance

- server-side query/paginate library results
- avoid giant client bundles
- lazy-load secondary interfaces
- do not download thousands of audio segments at once
- cache generated audio
- keep expensive provider calls server-side
- reuse generated vocabulary content unless regeneration is requested

---

# 32. PWA / Background Audio

Only after P0 is stable:

- add web app manifest
- make installable if straightforward
- integrate Media Session API where supported
- set current vocabulary word as media metadata

Do not promise background/lock-screen playback on platforms that prohibit it.

---

# 33. Tests

Implement meaningful tests for critical business logic.

## Unit tests

Required:

- word normalization
- duplicate equivalence
- Zod generated-content validation
- audio lesson script ordering/content
- spelling narration
- review queue generation
- shuffle uniqueness
- content hash/version behavior
- audio cache invalidation rules

## Integration tests

Cover:

- add word → persistence
- duplicate add → existing word response
- failed generation → safe failed status
- successful card + failed TTS → card remains usable
- regeneration → content version changes and narration audio becomes stale

## E2E golden path

At minimum cover a mocked/seeded path:

1. open Dashboard
2. add a word
3. word becomes ready
4. open detail page
5. start lesson
6. active transcript segment changes during playback
7. next word begins automatically

Prefer deterministic mocked provider/audio behavior for E2E.

Do not chase superficial 100% test coverage.

---

# 34. Acceptance Criteria

## Add Word

Given the user enters:

```text
parsimonious
```

the UI must:

- acknowledge the submission
- create or queue exactly one normalized vocabulary entry
- show processing status
- eventually show a learning card containing:
  - pronunciation
  - definition
  - ROOT / ORIGIN
  - MEMORY HOOK
  - synonyms
  - example sentence
- provide a way to hear the lesson
- keep the word after browser refresh

## Duplicate Integrity

Adding:

```text
Laconic
```

then later:

```text
 laconic 
```

must not create two records.

## Audio Review

With at least five ready words:

- open Audio Review
- choose Shuffle
- press Play
- hear word
- hear spelling
- hear pronunciation
- hear definition
- hear root/origin
- hear memory hook
- hear synonyms
- hear example
- transcript shows the same text
- active section highlights automatically
- next vocabulary word starts automatically
- queue contains no duplicate items

## Content Integrity

Every ready word must have:

- normalized word
- primary definition
- mnemonic
- at least one example
- sensible synonyms
- explicit etymology/root treatment
- no invented root claims
- narration derived from stored content

If decomposition is not justified, display language similar to:

> This word is not especially useful to decompose into modern GRE-style roots. Its historical origin is…

## Mobile

On a typical modern phone:

- no horizontal overflow
- input is easy to use
- transcript is readable
- active segment is obvious
- play button is easy to tap
- controls are reachable
- no critical functionality requires hover

---

# 35. Visual Design Direction

Aim for:

- calm
- premium
- modern
- minimal
- highly readable
- intellectually serious

Avoid:

- excessive gradients
- neon-heavy visual language
- clutter
- tiny text
- overly dense dashboards

Suggested information styling:

- Definition: neutral primary card
- ROOT / ORIGIN: analytical/linguistic styling
- MEMORY HOOK: distinct, slightly playful styling
- Synonyms: chips/tags
- Example sentence: context/quotation-style card

Strong typography matters more than decorative effects.

---

# 36. Implementation Process for Cursor

When beginning work:

1. Inspect the repository.
2. Identify the existing stack and reusable code.
3. Reuse compatible architecture rather than rebuilding unnecessarily.
4. Inspect package scripts and environment files.
5. Create a concise internal implementation checklist.
6. Implement P0 vertically, not as disconnected scaffolding.
7. Keep the app runnable throughout development.
8. Add tests alongside critical domain logic.
9. After major work, run:
   - lint
   - typecheck
   - tests
   - production build
10. Fix failures rather than merely reporting them when they are reasonably fixable.

**Do not stop after producing a plan.**

If a minor implementation choice is unspecified, make a reasonable decision and continue.

Avoid asking questions unless a decision truly blocks implementation.

Do not rewrite working existing architecture simply because another stack is personally preferred.

---

# 37. Suggested Vertical Implementation Order

Follow this sequence unless the existing codebase strongly suggests another:

### Phase 1 — Foundation

- framework/app shell
- database
- environment validation
- schema/migrations
- seed data
- navigation
- base responsive UI

### Phase 2 — Vocabulary Core

- normalization
- repository/service
- add word
- duplicate handling
- generation schema
- mock generation provider
- real provider adapter
- persistence
- library
- detail page

### Phase 3 — Audio Domain

- deterministic script builder
- content hashing/versioning
- TTS interface
- mock/browser fallback
- storage adapter
- segment persistence/cache

### Phase 4 — Audio Review

- review queue service
- shuffle
- player state
- sequential segment playback
- synchronized highlighting
- auto-scroll
- continuous next-word playback
- playback speed
- review history

### Phase 5 — P1

- batch add
- favorites
- regenerate
- search/filter/sort
- dashboard stats
- settings
- notes

### Phase 6 — Hardening

- error paths
- accessibility
- E2E
- mobile polish
- lint/typecheck/build
- README

---

# 38. README Requirements

Create a concise but complete README covering:

- what the app does
- stack
- directory structure
- prerequisites
- install commands
- `.env` configuration
- database migration
- seeding
- development command
- test commands
- lint/typecheck command
- production build
- AI provider behavior
- TTS behavior
- browser/mock fallback
- audio caching
- known limitations

Use exact commands that actually match the repository.

---

# 39. Final Engineering Handoff

After implementation, report only what is actually true.

Use this structure:

## What was built

Implemented functionality.

## Architecture

Technologies and important design decisions.

## Important files

Most relevant directories/files.

## Setup

Exact local commands.

## Environment configuration

Required variables, no secrets.

## Database setup

Exact migration/seed commands.

## Tests

What was run and whether it passed.

## Build status

Lint/typecheck/tests/build status.

## Known limitations

Anything incomplete or environment-dependent.

## Next highest-value improvements

Only the most valuable next steps.

Never claim a feature was completed if it was only scaffolded.

---

# 40. Core Product Principle

This is **not a saved dictionary**.

It is:

> **An automatically generated personal vocabulary podcast built from the exact words I encounter while studying.**

Every product and engineering decision should reinforce this learning network:

```text
WORD
  ↓
MEANING
  ↓
ROOT / STRUCTURE
  ↓
MEMORY IMAGE
  ↓
SYNONYMS / SEMANTIC NEIGHBORS
  ↓
CONTEXT
  ↓
SOUND
  ↓
SPELLING
```

The Audio Review experience is a first-class product surface, not an optional extra.

---

# 41. Non-Negotiable Checklist

Before considering the MVP complete, verify all of the following:

- [ ] I can rapidly add arbitrary vocabulary words.
- [ ] Words persist in PostgreSQL.
- [ ] Duplicate normalized words are prevented per user.
- [ ] Structured generated output is validated before persistence.
- [ ] Each ready word has a definition.
- [ ] Reliable root/etymology analysis is shown.
- [ ] Fake etymologies are never invented.
- [ ] Mnemonics are visually distinct from etymology.
- [ ] Synonyms are included.
- [ ] A contextual example is included.
- [ ] Pronunciation is included when reasonably available.
- [ ] Audio explicitly spells the word letter-by-letter.
- [ ] Narration is derived deterministically from saved content.
- [ ] Audio is segmented by logical lesson section.
- [ ] Audio can be cached and reused.
- [ ] Changed narration content invalidates stale audio.
- [ ] Review queues support shuffle.
- [ ] Playback automatically continues to the next word.
- [ ] The transcript is generated from the same audio script.
- [ ] The active transcript segment highlights automatically.
- [ ] The player works well on a phone.
- [ ] A failed TTS call does not destroy successful vocabulary content.
- [ ] Critical domain logic has automated tests.
- [ ] `.env.example` exists.
- [ ] Database migrations exist.
- [ ] Development seed data exists.
- [ ] README contains exact setup commands.
- [ ] Lint/typecheck/tests/build have been run and failures fixed where possible.

---

# 42. Definition of Success

The application succeeds when this experience is reliable:

I encounter a GRE word I do not know.

I add it in a few seconds and continue studying.

Later, while walking, commuting, exercising, cleaning, eating, or otherwise away from focused screen study, I press Play once.

The application continuously teaches me the exact words I previously encountered using:

- pronunciation
- spelling
- meaning
- accurate linguistic roots/origin
- a vivid mnemonic
- useful synonyms
- contextual usage

If I look at the screen, I can instantly see the exact lesson section currently being spoken.

Build toward that experience above everything else.
