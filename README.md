# GRE Learn

Personal GRE vocabulary podcast: add words you encounter while studying, auto-enrich them, and review with continuous synchronized audio lessons.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- **Firebase** (Firestore + Storage) when `DATA_DRIVER=firebase`
- **Local JSON store** when `DATA_DRIVER=local` (default — no Firebase required)
- **Zod** validation for AI-generated content
- **Vitest** + **Playwright**

## What it does

1. Add a GRE word quickly (or batch add)
2. Normalize + dedupe, generate structured learning content
3. Persist vocabulary for your default user
4. Build a **deterministic** audio lesson script from saved content
5. Play continuous review with segment highlighting and auto-advance

## Prerequisites

- Node.js 20+
- npm 10+
- Optional: Firebase project (for cloud persistence / storage)
- Optional: OpenAI API key (for live AI + TTS)

## Install

```bash
npm install
cp .env.example .env.local
```

Default `.env.local` uses local mocks (already provided).

## Environment

| Variable | Purpose |
|---|---|
| `DATA_DRIVER` | `local` or `firebase` |
| `AI_PROVIDER` | `mock` or `openai` |
| `AI_API_KEY` | Required if OpenAI AI |
| `AI_MODEL` | e.g. `gpt-4o` (default; use `gpt-4o-mini` only if you want cheaper calls) |
| `TTS_PROVIDER` | `mock` or `openai` |
| `TTS_API_KEY` | Optional; falls back to `AI_API_KEY` |
| `TTS_VOICE` | e.g. `alloy` |
| `AUDIO_STORAGE_DRIVER` | `local` or `firebase` |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key (`\n` escaped) |
| `NEXT_PUBLIC_FIREBASE_*` | Client SDK config (optional for this MVP) |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web Push certificate key for FCM digests |
| `CRON_SECRET` | Bearer token for `POST /api/cron/daily-digest` |
| `NOTIFICATIONS_PAIRING_SECRET` | Settings pairing code for enable / token / test send (falls back to accepting `CRON_SECRET` as Bearer) |
| `DEFAULT_USER_ID` | Defaults to `default-user` |

Never commit real secrets.

### Firebase setup

1. Create a Firebase project
2. Enable **Firestore**
3. Enable **Storage** if using Firebase audio storage
4. Create a service account → download JSON
5. In `.env.local`:

```dotenv
DATA_DRIVER=firebase
AUDIO_STORAGE_DRIVER=firebase
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@....iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

Recommended Firestore composite indexes when filtering heavily:

- `vocabulary`: `userId` + `normalizedWord`
- `vocabulary`: `userId` + `isFavorite`
- `vocabulary`: `userId` + `status`

## Seed demo words

```bash
npm run seed
```

Seeds ~12 GRE words (demo data) into the local store. Marked with `isDemo` in the UI.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e   # requires browsers: npx playwright install
npm run build
npm start
```

## Directory structure

```text
src/
  app/                 # routes + API
  components/          # navigation shell
  features/
    vocabulary/        # domain, schema, repo, UI
    generation/        # AI providers + prompts + seed content
    audio/             # lesson script, TTS, player
    review/            # queue / shuffle
  lib/                 # env, errors, firebase admin, utils
scripts/seed.ts
tests/unit|integration|e2e
```

## AI behavior

- `AI_PROVIDER=openai` calls Chat Completions **once per new word**, validates with Zod (one repair retry), then **persists the full card**
- Re-adding the same normalized word, opening detail, library, and audio review **never** re-call OpenAI
- Only **Regenerate** on a word page spends another AI call
- `AI_PROVIDER=mock` uses curated seed content / placeholders (no API key)
- Etymology is never treated the same as the **Memory Hook** in the UI

## TTS behavior

- `TTS_PROVIDER=mock`: browser `speechSynthesis`, labeled in the player; still stores hash-keyed segment cache records
- `TTS_PROVIDER=openai`: generates MP3 segments, stores under `public/audio/generated` or Firebase Storage
- Narration always comes from `buildAudioLessonScript(savedContent)` — not a second AI script
- Favoriting / review counts do **not** invalidate audio; content regeneration does

## PWA + Today’s English digests

- Installable PWA shell (`manifest.webmanifest`, icons, `/sw.js`). Enable digests under **Settings**.
- Opt-in evening push (default **20:00** local) via FCM when Firebase web config + `NEXT_PUBLIC_FIREBASE_VAPID_KEY` + Admin credentials are set.
- Set `NOTIFICATIONS_PAIRING_SECRET` (recommended) and enter that code in Settings to enable digests, register a phone, or send a test. Cron remains `Authorization: Bearer $CRON_SECRET`.
- Scheduler: `POST /api/cron/daily-digest` with `Authorization: Bearer $CRON_SECRET` (optional `?ignoreSendHour=1` for dry runs).
- Quiet/empty days send a **specific next step** from the learning path continue target — not a vague nudge.
- Media Session / home-screen widgets are still out of scope.

## Known limitations

- Single default user (`DEFAULT_USER_ID`) — multi-user auth not wired yet (schema is user-scoped)
- Browser speech has imperfect timing vs. server MP3s
- Firestore list filtering for free-text is in-memory after a user query
- Digests no-op gracefully when FCM/VAPID is not configured

## License

Private / personal use unless otherwise specified.
