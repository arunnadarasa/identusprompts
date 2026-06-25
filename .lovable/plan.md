# Make the catalog Creative-AI-native

Pivot every idea from "web3 app with voice bolted on" to **"Lovable AI brain + one ElevenLabs voice surface"**, with translation included only where audience reach matters. Regenerate titles, pitches, sub-disciplines, and mega-prompts for all 1,000 entries using AIsa (since Lovable AI credits are exhausted).

The runtime mega-prompts still tell participants to use **Lovable AI Gateway + ElevenLabs connector** — they have free credits.

---

## 1. New idea recipe

Every idea follows the same shape, so the 5-credit one-shot budget always works:

```text
[Creative person] uses [Lovable AI–generated content]
spoken / heard / captured via [ONE ElevenLabs surface]
( + translation, only when audience reach matters )
```

Worked examples (one per kernel):

- **Dance · TTS + translate** — Krump Fuel Coach: Lovable AI writes a nutrition plan for tonight's session → translate to dancer's language → ElevenLabs narrates it so they can listen while stretching.
- **Writing · Voice Agent** — Manuscript Doctor: voice agent that interviews the author about a stuck chapter, Lovable AI rewrites the passage live, agent reads it back.
- **Music · Realtime STT** — Lyric Catcher: hum + mumble into the mic, Scribe transcribes the mumbled syllables, Lovable AI proposes full lyrics in your style.
- **Film · Music/SFX** — Scene Scorer: paste a scene description, Lovable AI writes a music brief, ElevenLabs Music renders a 30s cue.

## 2. Kernel mapping (10 disciplines × 100 ideas)

Keep the existing 4-hook distribution per theme but reframe each hook around the recipe above:

| Hook id | Voice surface | Translation default |
| --- | --- | --- |
| `tts-narration` | ElevenLabs streaming TTS | **on** (coaching, storytelling, education) |
| `voice-agent` | `@elevenlabs/react` agent | **on** (the agent speaks the user's language) |
| `realtime-stt` | Scribe realtime | **off** (input modality, not output) |
| `music-sfx` | ElevenLabs Music + SFX | **off** (non-linguistic output) |

The translation flag drives whether the mega-prompt asks for a `<Select>` of target languages and a `model_id: "eleven_multilingual_v2"` hint.

## 3. Pipeline rewrite

### 3a. `scripts/regenerate_ideas.py` — full rewrite via AIsa

- Read `AISA_API_KEY` from env (already set as a project secret).
- Treat AIsa as OpenAI-compatible; if the endpoint differs, fail loud with the env var name to set.
- For each of the 10 themes, generate 100 ideas in batches of 10 with a single structured prompt that requires `{title, pitch, subDiscipline, quantumHookId, tam, sam, som}` per idea. The prompt explicitly forbids: blockchain, NFT, royalties, provenance, ledger, gas, onchain, web3, DAO, wallet.
- Distribute the 4 kernel ids across each theme's 100 ideas (25 each) so the catalog stays balanced.
- Preserve stable `id` slugs `{theme}-{slug-of-title}-{n}` so old URLs don't 404 where titles happen to match; otherwise accept new ids (showcase is fresh, no inbound links to lose).
- Write back to `src/data/ideas/{theme}.json` keeping the existing `{theme, ideas[]}` envelope.

### 3b. `scripts/rewrite_mega_prompts.py` — new one-shot template

New body for every prompt, replacing the current text:

```text
Build "<TITLE>" as a ONE-SHOT Lovable build (5 credits, single message).
Single-page TanStack Start app. One route, one server function. No auth,
no DB unless the idea truly needs one — and if it does, use Lovable Cloud.

CONCEPT
<PITCH>
Discipline: <THEME> (<SUB-DISCIPLINE>).

THE RECIPE
1. Brain — Lovable AI Gateway (already wired via LOVABLE_API_KEY).
   Default model: google/gemini-3-flash-preview. Use `streamText` from `ai`
   with `@ai-sdk/openai-compatible` pointed at https://ai.gateway.lovable.dev/v1.
2. Voice — ElevenLabs <KERNEL_LABEL> via the linked connector
   (ELEVENLABS_API_KEY, server-only, header `xi-api-key`).
   <KERNEL_RECIPE>          # streaming TTS / useConversation / Scribe / Music+SFX
3. Translation — <ON|OFF>
   If ON: add a language <Select> (en/es/fr/de/pt/hi/ja). Translate the
   Lovable AI output via Lovable AI before sending to ElevenLabs, and use
   model_id "eleven_multilingual_v2".

UI
<UI_HINT_FROM_HOOKS_JSON>. Editorial type, generous whitespace, one accent.
Render markdown from the AI with react-markdown.

BUDGET RULES
- One TanStack server fn for the AI call, one for the voice call (or fold
  them together if the voice call doesn't need a key).
- No tests, no Storybook, no extra pages, no theming layer.
- If you reach for a second route or a database, cut scope instead.

STRETCH (only if the first build comes in under budget)
<ONE_LINE_STRETCH>
```

Hook-specific blocks (`KERNEL_RECIPE`) come from `src/data/ideas/hooks.json` and follow the patterns in the `elevenlabs-tts`, `elevenlabs-agents`, and TTS/agents knowledge files exactly — streaming endpoint with `output_format` as a query param, `@elevenlabs/react` `useConversation` with `connectionType: "webrtc"`, etc.

### 3c. `src/data/ideas/hooks.json` — already on the four ElevenLabs primitives

No change to ids; refresh `ui` strings so they read as voice-native UI hints (e.g. `tts-narration` → "Big play button, transcript drawer, language select if translation is on").

## 4. Surface copy & helpers

- `src/lib/plain-language.ts` — rewrite the description generator to speak in terms of "Lovable AI generates X, ElevenLabs <verb> it" instead of the current web3-residual phrasing.
- `src/routes/ideas.$id.tsx` — replace the "Required keys" section with a single **One-Connector Protocol** card: the ElevenLabs connector + Lovable AI (no key needed for participants). Remove any remaining `SEPOLIA_RPC_URL`/`ETHERSCAN_API_KEY`/`PRIVY_APP_ID`/`METAMASK_PRIVATE_KEY` references.
- `src/routes/strategy.tsx`, `src/routes/quantum-primer.tsx`, `src/routes/about.tsx` — sweep for any remaining "five-secret", web3, or contract-verification language; replace with the recipe above.
- `public/llms.txt` — refresh the summary sentence to describe the new recipe.

## 5. Showcase

The existing `/showcase/pitch-reader` route already speaks the new language (TTS over a curated pitch). After the regeneration, the six featured ideas it picks will read as voice-native, no code change needed there.

## 6. Verification

- Run `scripts/regenerate_ideas.py` → 10 files × 100 ideas, zero matches for the blocklist (`rg -i 'nft|onchain|ledger|provenance|royalt|wallet|gas\b|web3|dao' src/data/ideas/`).
- Run `scripts/rewrite_mega_prompts.py` → all 1,000 `megaPrompt` fields contain "Lovable AI" and "ElevenLabs" and either "translate" or "no translation" depending on the kernel.
- Spot-check 4 ideas (one per kernel) by opening `/ideas/<id>` and reading the prompt end-to-end.
- Verify the index, theme pages, and `/showcase/pitch-reader` still render and one TTS playback still works.

## Technical details

- AIsa client: assume OpenAI-compatible `chat.completions` with structured-output JSON mode; base URL configurable via `AISA_BASE_URL` env, default `https://api.aisa.ai/v1` — fail fast with the exact env var name if the endpoint 404s so you can correct it before the long run.
- Batching: 10 ideas per request, ~100 requests per theme, ~1,000 total; `--delay 1.0` between calls, resumable via per-theme checkpoint files in `scripts/.cache/`.
- Stable IDs: slugify(title) + numeric suffix when collisions happen inside a theme. Old IDs are not preserved across regeneration; this is a clean break and acceptable because nothing external links into individual ideas yet.
- Mega-prompt template lives as a single string in `rewrite_mega_prompts.py` with `{}` slots, no AI involved in this step — purely deterministic templating from the regenerated concept JSON.
- Translation flag is derived from kernel id, not stored on each idea, so future kernel-recipe tweaks don't require re-regenerating ideas.
