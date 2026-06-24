# Refine every mega-prompt with AIsa

AIsa is OpenAI-compatible at `https://api.aisa.one/v1` with a bearer `AISA_API_KEY`. I'll use it as a one-off, offline batch to upgrade all 1,000 mega-prompts, then ship the improved JSON. No runtime API calls, no Lovable Cloud, no frontend changes — the site keeps loading static JSON.

## Step 1 — Store the key

When build mode starts, request `AISA_API_KEY` via `add_secret`. The key is only read by the offline refinement script (`/tmp/refine_prompts.py`) executed in this sandbox; it is never bundled into the client or shipped to Cloudflare.

## Step 2 — Model choice

Default: `**gpt-5-mini**` via `POST /v1/chat/completions` — strong instruction-following, $0.15 in / $1.20 out per 1M tokens. Estimated total for 1,000 refinements (~600 in + ~400 out tokens each): **≈ $0.60–$1.20**. (Fallback if rate-limited: `gemini-3.5-flash`.) I'll set `temperature: 0.4` and force a JSON response so parsing is robust.

## Step 3 — The refinement task per idea

For each of the 1,000 ideas I send:

- The original generated mega-prompt
- The idea's `title`, `pitch`, `subDiscipline`, `quantumHook`, `quantumHookId`, kernel description, and the grid shape (e.g. "10×10 fidelities")
- A system prompt that locks in the non-negotiables:

```text
You are a senior Lovable + Quantinuum hackathon prompt engineer.

Rewrite the user-supplied mega-prompt so a free-tier Lovable account (~5 build
credits) can ship a real-quantum demo in ONE build message. Keep ALL of:

  - the build-time quantum pattern (pip install guppylang selene-sim in the
    Lovable Linux sandbox; quantum/kernel.py + quantum/run.py; output to
    src/data/quantum-results.json; React reads it statically)
  - the specific Guppy/Selene kernel and grid shape provided
  - one page (workspace) + "About the quantum" strip; no Cloud, no auth, no DB
  - the "Quantum trace" disclosure showing raw output + kernel.py source
  - the explicit "ship in one message, ~5 credits" budget warning

Make it sharper, more concrete, and easier for the Lovable agent to act on:
- name the exact files, imports, and selene_sim APIs to use
- collapse fluff; aim for ~250-320 words
- write the UI in concrete shadcn/Tailwind nouns (Card, Slider, Tabs) instead of vague layouts
- add a 4-step "Build order" the agent must follow to avoid scope creep

Return JSON: { "megaPrompt": "<the refined prompt as a single string>" }.
Do not return anything else.
```

## Step 4 — Offline batch runner

Script at `/tmp/refine_prompts.py`:

- Loads `src/data/ideas/*.json` (the 10 theme files plus hooks/themes manifests).
- Iterates ideas, calls AIsa with the prompt above. Concurrency ~8 with retry/backoff on 429/5xx.
- Validates each response (JSON parse, length 150–500 words, contains the required substrings: `pip install guppylang selene-sim`, `quantum/kernel.py`, `quantum-results.json`, `~5 credits`). Failures fall back to the existing prompt and are logged.
- Writes the refined `megaPrompt` back in place. Saves an audit log to `/tmp/refine_log.json`.

I'll start by refining a 5-idea sample (one per major theme), spot-check the output, then run the full 1,000. If the sample looks wrong I'll adjust the system prompt before burning the rest of the budget.

## Step 5 — Ship

Re-read 3 random ideas across 3 themes to confirm the refined prompts still pass the acceptance checklist from the previous plan (sandbox instructions, JSON output, 5-credit warning, ≤~350 words). No UI changes needed — the idea detail page already renders `idea.megaPrompt`.

## Open question

Use `gpt-5-mini` as proposed, or do you want a different model from the AIsa catalog (e.g. `claude-haiku-4-5-20251001` for tighter writing, or `qwen-flash` to save ~10× on cost)? If you don't say, I'll go with `gpt-5-mini`. 

use Claude haiku for tighter writing