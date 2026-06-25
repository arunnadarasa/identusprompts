## Goal

Strip every reference to ElevenLabs / Lovable AI / blockchain from the site, the catalog, and the showcase. The whole project becomes AIsa-native: one API key (`AISA_API_KEY`), one base URL (`https://api.aisa.one/v1`), four creative kernels.

## Four AIsa kernels

Each idea is mapped (deterministically, by current hook id) to one kernel:

1. **aisa-chat** — LLM router (`/chat/completions`, OpenAI-compatible). Models like `openai/gpt-4o-mini`, `anthropic/claude-haiku`, `google/gemini-flash`, `qwen/qwen-2.5`. The "brain" for coaches, critics, planners, story engines.
2. **aisa-image** — Image generation (`/images/generations`, OpenAI-compatible, Seedream backend). Covers, moodboards, posters, scene art.
3. **aisa-video** — Video generation (Wan / Seed, async pattern). Short clips, ambient loops, motion sketches. Prompt warns about polling + cost; used sparingly.
4. **aisa-skills** — Agent Skills / data APIs (web search, scholar, YouTube SERP, Twitter, market/crypto, perplexity research). Powers research-flavoured ideas (trends, comps, citations).

Mapping rule in `scripts/rewrite_mega_prompts.py`: prior voice/blockchain hook ids fall back to `aisa-chat` by default; ideas whose discipline naturally implies visuals → `aisa-image`; motion/film/dance subset → `aisa-video`; research/marketing/finance subset → `aisa-skills`. Roughly 55 / 25 / 5 / 15 split.

## Catalog regeneration

- `scripts/regenerate_ideas.py`: keep AIsa-only mode (8 parallel workers, 40 batches × 25 ideas). Update the system/user prompt to demand AIsa-native concepts — no audio surfaces, no contracts, no Privy, just chat/image/video/skills + UI.
- `scripts/rewrite_mega_prompts.py`: full rewrite. Each mega-prompt:
  - **Header**: "ONE-SHOT, ~5 CREDITS" budget rule.
  - **Stack**: TanStack Start, single page, one `createServerFn`, no DB, no auth.
  - **AIsa setup**: `AISA_API_KEY` secret, `https://api.aisa.one/v1`, kernel-specific endpoint + minimal code snippet.
  - **Kernel-specific scaffold**:
    - chat → `fetch /chat/completions` with chosen model
    - image → `fetch /images/generations`, render returned URL
    - video → submit + poll task id, show progress, render final mp4
    - skills → call the relevant skill endpoint, render structured result
  - **UX**: one form, one result surface, loading + error states (handle 402/429).
  - **Footer**: hackathon credit + link to `https://creativequantum.lovable.app/`.

Run order: `regenerate_ideas.py` → `rewrite_mega_prompts.py` → quick scrub for stale "ElevenLabs / Voice / TTS / Privy / Sepolia / blockchain" terms in titles/pitches.

## UI rebrand (text + nav only, keep gold/cream)

- `src/routes/__root.tsx` — site name, default title/description/OG.
- `src/components/site-shell.tsx` — wordmark "AIsa AI Creative", nav copy.
- `src/routes/index.tsx` — hero, kernel cards (Chat / Image / Video / Skills), copy.
- `src/routes/about.tsx`, `src/routes/strategy.tsx`, `src/routes/quantum-primer.tsx` (rename to `aisa-primer.tsx` + add redirect-free route) — rewrite copy + code snippets for AIsa endpoints.
- `src/lib/plain-language.ts` — propositions phrased around AIsa kernels.
- `src/data/ideas/hooks.json` — replace hook entries with the four AIsa kernels.
- `public/llms.txt` — re-author for AIsa Creative.
- Delete remnants: `src/lib/tts.functions.ts`, ElevenLabs-flavoured copy, voice-only badges.

## Showcase — replace Pitch Reader with Pitch Critic

- Delete `src/routes/showcase.pitch-reader.tsx` and the ElevenLabs server fn.
- New `src/lib/aisa-chat.functions.ts`: `createServerFn` POST → AIsa `/chat/completions` with a hard-coded critic system prompt; reads `process.env.AISA_API_KEY`; returns `{ critique: string }`; surfaces 402/429 errors cleanly.
- New `src/routes/showcase.pitch-critic.tsx`: textarea + "Critique" button → renders streamed/returned markdown critique. No persistence.
- Update `src/routes/showcase.index.tsx` to feature Pitch Critic and remove all ElevenLabs language.

## Secrets

`AISA_API_KEY` already set. No new secrets required.

## Verification

1. Run regen + rewrite scripts; spot-check 5 random ideas (one per kernel + multilingual variant).
2. `grep -ri "elevenlabs\|privy\|sepolia\|blockchain\|voice agent\|tts\|stt\b" src public` returns no business-logic hits.
3. Playwright smoke at 1280px and 384px: home, /themes, one idea page (mega-prompt wraps), /showcase, /showcase/pitch-critic (submit a short pitch, get a critique).
4. `stack_modern--invoke-server-function` POST to the critic server fn end-to-end.

## Out of scope

- Visual redesign / palette change (text + nav only, per your answer).
- Per-user OAuth, persistence, or DB.
- Any new secrets beyond `AISA_API_KEY`.
