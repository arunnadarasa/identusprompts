# Pivot: AIsa → fly.io Sprites (full swap)

Rebrand the entire archive from "AIsa Creative — 1,000 AIsa hackathon ideas" to a Sprites-native archive. Keep the 10 creative disciplines and the editorial folio design; swap every primitive, mega-prompt, and copy surface to sprites.dev, and point the working showcase at the reference repo `github.com/arunnadarasa/sprite-sandbox-fun`.

## 1. New primitives (`src/data/ideas/hooks.json`)

Replace the four AIsa kernels with four Sprites primitives, matching the skill's invariants:

1. **Sprite Sandbox** — `POST /sprites` creates a public micro-VM with a hosted URL; the disposable canvas every idea ships on.
2. **Filesystem Drop** — `PUT /sprites/{name}/fs/write` places `index.html`, assets, scripts under `/root/www` (parents auto-created).
3. **Long-running Service** — `PUT /sprites/{name}/services/{svc}` + `/start` runs `python3 -m http.server 8080` (or any cmd) with `http_port` for wake-on-request.
4. **One-shot Exec** — `POST /sprites/{name}/exec?cmd=...` streams stdout back; the "run this shell command inside the sandbox" primitive.

Each hook keeps the existing shape (`id`, `name`, `tag`, `kernel`, `ui`) so downstream code doesn't change.

## 2. Regenerate 1,000 ideas around Sprites

Rewrite `scripts/regenerate_ideas.py` prompts so every idea:
- keeps its creative discipline + audience + market anchor
- centers exactly one Sprites primitive as the user surface
- describes an ephemeral micro-app the user (or their AI agent) spins up on demand — moodboards, rehearsal timers, generative canvases, per-scene sandboxes, share-links that self-destruct
- drops all AIsa/LLM language; replaces `chainRationale` semantics with "why Sprites vs. a normal deploy"

`scripts/rewrite_mega_prompts.py` gets the same treatment: each mega-prompt becomes a single Lovable build using one TanStack server function calling `api.sprites.dev/v1` with one `SPRITES_TOKEN`, following the skill's minimal recipe (create → fs/write → service PUT → start → warm-poll URL).

Delete `.regen-checkpoint.json` before running. Output overwrites `src/data/ideas/<theme>.json`. No schema changes to `src/data/ideas.ts` or `<Idea>` type.

## 3. Copy + route rewrites

- `src/routes/index.tsx` — hero, tiles, section headers, stat tile ("1k Sprite Entries"), status ("Running on Sprites"), "Get an API Key" → `https://sprites.dev/account`.
- `src/routes/quantum-primer.tsx` — replace with a Sprites primer: what a sprite is, the four primitives, the token shape gotcha, the `/root/www` gotcha, the `http_port` gotcha (mined from the skill).
- `src/routes/strategy.tsx` — swap AIsa snippets for Sprites snippets: create-sprite server fn, fs/write server fn, service+start server fn, warm-poll pattern. Env block shows `SPRITES_TOKEN` from `sprites.dev/account`.
- `src/routes/about.tsx`, `src/components/site-shell.tsx`, `src/routes/themes.tsx`, `src/routes/themes.index.tsx`, `src/routes/themes.$theme.tsx`, `src/routes/ideas.$id.tsx`, `src/routes/__root.tsx` — swap AIsa → Sprites in nav, headings, meta tags, footer credit.
- Footer credit becomes: "Built during the Sprites Creative Hackathon — StreetKode Fam · Indian Krump Festival 14" (or whatever variant the user prefers; I'll keep the current festival credit and swap only the tool name).
- Per-route `head()` meta: unique Sprites-oriented title/description/og for `/`, `/themes`, `/themes/$theme`, `/ideas/$id`, `/quantum-primer`, `/strategy`, `/about`, `/showcase`.

## 4. Showcase

Retire the AIsa pitch-critic:
- Delete `src/routes/showcase.pitch-critic.tsx` and `src/lib/aisa-chat.functions.ts`.
- Rewrite `src/routes/showcase.index.tsx` and `src/routes/showcase.tsx` as a "Reference implementation" page: explains the Sprites deploy flow from the skill, embeds the four code snippets, and links prominently to **`https://github.com/arunnadarasa/sprite-sandbox-fun`** as the working end-to-end example. No live launcher, no `SPRITES_TOKEN` secret needed in this project.

## 5. Secrets + docs

- No new secret required (showcase is docs-only).
- `AISA_API_KEY` reference stays only inside the regeneration script (used locally to regenerate ideas), not in app code.
- Update `public/llms.txt` and `AGENTS.md` to describe the Sprites archive.

## Out of scope

- The 10 theme slugs, emojis, and market anchors stay unchanged.
- Editorial visual design, tokens in `styles.css`, and component structure stay unchanged.
- No new routes, no auth, no DB.

## Technical details

- Uses the `fly-sprites` skill's minimal recipe verbatim for snippet code (create → fs/write → service PUT → start → warm-poll), including the "no `Accept` header on exec" and "serve from `/root/www`" gotchas.
- Regeneration runs locally via `AISA_API_KEY=... python3 scripts/regenerate_ideas.py` — Sprites are the *subject* of the ideas; AIsa still generates the text.
- `<Idea>`/`<Hook>`/`<Theme>` TS types unchanged; only string values swap, so `src/data/ideas.ts` and all consumers keep compiling.
