# Regenerate the remaining ideas via AISA (parallel)

## Current state

The checkpoint at `scripts/.regen-checkpoint.json` has all 40 (theme × hook) batches cached, but it doesn't record which provider produced each one. From the prior run, roughly 12 batches came from AISA (~300 ideas) and ~28 from the Lovable fallback (~700 ideas). We can't reliably tell them apart per-batch.

## Approach

Since the AISA balance is healthy ($16.97), the safest and simplest fix is to **re-run all 40 batches through AISA only** with parallel workers. This guarantees every idea is AISA-generated and is faster than trying to detect-and-replace.

Changes to `scripts/regenerate_ideas.py`:

- **Drop the checkpoint** before running so every batch hits AISA fresh (rename to `.regen-checkpoint.lovable-mixed.json` for safety, don't delete).
- **AISA-only mode**: add `AISA_ONLY=1` env flag that disables the Lovable fallback so a bad batch surfaces as a hard error instead of silently degrading.
- **Concurrency 8** workers (up from 2) — 40 batches finish in ~5 waves.
- **Retries**: keep 6 retries with exponential backoff; on AISA 429, back off longer.
- **Model**: `qwen3.7-max` (per AISA docs default).
- **Per-batch logging**: print `[done X/40] theme::hook -> 25 ideas` so progress is visible.

After AISA returns, the script rebuilds each theme JSON using the **lean 5-credit `make_prompt()`** template already in `scripts/rewrite_mega_prompts.py` (single-page, Privy + 1 contract + optional Pinata, hackathon credit in NatSpec + UI footer). No template regression — the budget rules from the last approved plan stay intact.

## Out of scope

- No UI changes, no field renames.
- No new secrets, no Lovable Cloud.
- No edits to themes / hooks lists.

## Risk

If AISA rate-limits at 8 concurrent, backoff handles it. If a batch genuinely fails after all retries, the script logs the failing key and the corresponding theme retains its prior ideas — user can rerun just that batch.
