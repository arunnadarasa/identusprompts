
# Creative Quantum — Hackathon Idea Repo

A browse-only static site for participants of the Creative Quantum hackathon. 10 creative disciplines × 100 ideas each = **1,000 ideas**. Each idea card shows a title, a one-line pitch, and the Guppy/Selene quantum pattern it leans on. Clicking a card opens a detail view with a copy-ready **mega-prompt** for Lovable and a **TAM / SAM / SOM** breakdown.

## Disciplines (10 themes × 100 ideas)

1. Dance & Choreography
2. Music & Sound Design
3. Visual Art (painting, illustration, generative)
4. Videography & Film
5. Photography
6. Writing, Poetry & Narrative
7. Filmmaking & Animation
8. Game Design & Interactive Media
9. Theater & Live Performance
10. Fashion & Textile Design

## What each idea contains

```text
{
  id, theme, title,
  pitch:        "one-sentence hook",
  quantumHook:  "SWAP test | QTDA | amplitude encoding | Grover | QFT | ...",
  megaPrompt:   "copy-paste Lovable prompt, ~150-300 words",
  tam, sam, som:"$ figure + 1-line reasoning"
}
```

Cards in the grid show **title + pitch + quantum-hook chip**. The detail panel reveals the mega-prompt (with copy button) and the TAM/SAM/SOM.

## Site structure (TanStack routes)

```text
/                      Landing — hackathon intro, link to creativequantum.lovable.app,
                       feature strip "10 themes · 1000 ideas · quantum-ready"
/themes                Grid of the 10 disciplines with counts
/themes/$theme         Filterable list of 100 ideas for that discipline
/ideas/$id             Full idea detail: pitch, quantum hook, mega-prompt (copy),
                       TAM/SAM/SOM, "open in Lovable" CTA
/quantum-primer        Short reference: which Quantinuum pattern fits which problem
                       (SWAP test → similarity, QTDA → shape of data, amplitude
                       encoding → embeddings, Grover → search, QFT → periodicity)
/about                 Hackathon link, how to use the repo, credits
```

Each route gets its own `head()` with unique title/description/OG tags.

## Idea generation workflow (offline, before commit)

Use the `ai-gateway` skill to author 1,000 ideas as static seed JSON — no runtime AI, no backend.

1. Write `/tmp/generate_ideas.py` that, for each of 10 themes, calls the AI gateway with a structured schema requiring 100 unique ideas (title, pitch, quantumHook from a fixed enum, megaPrompt, tam, sam, som). Run in batches (e.g. 20 ideas × 5 calls per theme) to stay within token budgets.
2. Deduplicate by title within each theme and lightly QA each batch.
3. Output one file per theme: `src/data/ideas/{theme}.json`.
4. Generate `src/data/ideas/index.ts` that re-exports all 10 and a flat `allIdeas` array.

The mega-prompt template enforces: project name, target user, core interaction, the specific Guppy/Selene pattern to invoke, expected UI surfaces, and a "use Lovable Cloud only if needed" guardrail — so participants get prompts that work well on Lovable + Quantinuum out of the box.

## UI / design direction

Dark, lab-notebook aesthetic with a faint quantum-grid background and accent gradients that read as "creative tools meet physics," not generic AI-purple. Mono captions for the quantum-hook chip, serif display for idea titles, sans body. Cards have hover-only motion (subtle phase-shift glow). Strict semantic tokens in `src/styles.css` — no hardcoded colors in components.

## Technical notes

- Pure static — no Lovable Cloud, no auth, no DB. All data ships in `src/data/ideas/*.json`, imported directly.
- Search + theme filter run client-side over the in-memory `allIdeas` array (Fuse.js or a tiny custom matcher).
- "Copy mega-prompt" button uses `navigator.clipboard`; toast confirms via existing `sonner`.
- Route files under `src/routes/` only (no `src/pages/`); each leaf route sets its own head meta.
- `src/routes/index.tsx` placeholder gets fully replaced with the landing page.
- Quantum patterns referenced in cards link to `/quantum-primer#<pattern-id>`; the primer pulls language from the `quantinuum` skill (SWAP test, QTDA, amplitude encoding, etc.) so participants know which `@guppy` shape to start from.
- Idea generation script lives in `/tmp` and is run once; only the resulting JSON is committed.

## Out of scope

- No accounts, favorites, or persistence.
- No live AI generation in the deployed site.
- No quantum execution in-browser — the repo points participants at Selene/Guppy; it doesn't run circuits.
