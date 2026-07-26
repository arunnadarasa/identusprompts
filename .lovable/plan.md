## Problem

Every theme currently shows an uneven primitive distribution — Dance is 50 / 0 / 25 / 25 (Sandbox / Filesystem Drop / Long-running Service / One-shot Exec), so the theme page renders "3 PRIMITIVES" and Filesystem Drop filters to zero entries. Cause: `scripts/rewrite_mega_prompts.py` remaps legacy hook ids one-to-one, and the legacy hooks weren't evenly distributed (AIsa-chat, tts-narration, sepolia-deploy all collapsed into `sprite-create`; `sprite-fs` legacy sources barely appear in surviving data).

## Fix

Redistribute the 100 ideas per theme so each Sprites primitive owns exactly 25, then regenerate the mega-prompts, rationales, and plain-language copy from the new assignments.

### Redistribution rule

In `scripts/rewrite_mega_prompts.py`, drop `LEGACY_MAP` and replace `remap_kernel` with a deterministic round-robin over the ideas array:

- Order: `sprite-create`, `sprite-fs`, `sprite-service`, `sprite-exec`.
- Assign `HOOKS[i % 4]` to idea at index `i`, so each theme yields 25/25/25/25.
- Keep the existing per-primitive rationale, UI blurb, and prompt-body templates — they already cover all four primitives.

### Regeneration

- Run the updated script over all 12 theme JSONs in `src/data/ideas/`.
- Each idea's `quantumHook`, `quantumHookId`, `quantumTag`, `quantumRationale`, `pitch`, and `megaPrompt` get rewritten from the new primitive.
- Spot-check one idea per primitive in `dance.json` and one other theme to confirm the primer + gotchas block is still inlined and the primitive-specific server-fn snippet matches.

### Verification

- `python3 -c "…Counter(quantumHookId)…"` on every theme file → each returns `{sprite-create:25, sprite-fs:25, sprite-service:25, sprite-exec:25}`.
- Load the Dance theme page in preview → header reads "4 PRIMITIVES" and the Filesystem Drop filter shows 25 entries.
- Run the project type-check.

## Out of scope

- No UI or component changes; the theme page already counts primitives dynamically.
- Idea titles stay as-is — only the primitive assignment and derived copy change.
