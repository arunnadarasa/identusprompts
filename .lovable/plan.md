## Demo pick: **Pitch Reader**

A single page that lists a curated handful of ideas from the index. Each row has a "▶ Hear the pitch" button. Tap it → a TanStack server function calls ElevenLabs TTS with the idea's `pitch`, streams MP3 back, and the browser plays it.

Why this one:
- Uses the **TTS** kernel (the simplest of the four) and the connector-synced `ELEVENLABS_API_KEY` — zero secret setup for the participant.
- Self-referential: the showcase narrates the showcase, which is exactly the "live demo lands here" promise on the landing page.
- Genuinely fits the 5-credit / one-shot budget: one server fn, one route, one button. No DB, no Cloud, no extra deps.

## What gets built

1. `src/lib/tts.functions.ts` — one `createServerFn({ method: "POST" })` that:
   - validates `{ text: string (1..2000) }` with zod
   - POSTs to `https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream?output_format=mp3_44100_128` with `xi-api-key: process.env.ELEVENLABS_API_KEY` and `model_id: eleven_turbo_v2_5`
   - returns `{ audio: base64 }` (via `Buffer.from(...).toString("base64")`, never the spread+btoa anti-pattern)
   - JSDoc carries the hackathon credit line

2. `src/routes/showcase.pitch-reader.tsx` — a new leaf route under the existing `showcase` layout:
   - Editorial header reusing the gold/cream folio tokens (no hardcoded colors).
   - Lists ~6 hand-picked ideas (one per discipline) loaded from the existing `src/data/ideas.ts` helpers, showing `title` + `pitch` + voice tag.
   - Per row: a "▶ Hear the pitch" button wired to `useServerFn(speak)`; uses `new Audio(\`data:audio/mpeg;base64,${audio}\`).play()`.
   - Tracks per-row playing/loading/error state so only one plays at a time.
   - Footer line: hackathon credit.
   - `head()` sets a unique title, description, and og:title/og:description.

3. `src/routes/showcase.index.tsx` — promote Pitch Reader from "coming soon" to a real shipped card linking to `/showcase/pitch-reader`, keep the "Vol. 01 · In production" copy block underneath for the other slots.

4. `public/llms.txt` — add one line registering `/showcase/pitch-reader` as the first live demo.

## Out of scope (deliberately)

- No persistence, no auth, no analytics, no audio caching layer.
- No regeneration of the 996 mega-prompts (rebrand-stale titles like "Choreo audio logs" stay for now — separate task).
- No new design tokens; reuses the existing gold/cream system.

## Technical notes

- ElevenLabs standard connector is already linked, so `ELEVENLABS_API_KEY` is on `process.env` inside the server fn handler. Never imported on the client, never prefixed `VITE_`.
- Server fn lives in `src/lib/` (not `src/server/`) per the import-protection rules.
- Voice id `JBFqnCBsd6RMkjVDRZzb` (George) and model `eleven_turbo_v2_5` come from the knowledge defaults for low-latency narration.
- Errors from ElevenLabs (402 credits, 429 rate limit, etc.) surface as a per-row inline error pill, not a global toast.

## Proof of the 5-prompt promise

This whole thing is one Lovable build message worth of work. Once it ships I'll annotate the showcase card with "Built in 1 prompt" so participants can see the budget claim is real.
