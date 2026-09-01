# Rename credit: StreetKode → Midnight Aliit Builder & Nightforce Alpha

Replace every "StreetKode Fam" credit across the app, the slide deck, the LLM knowledge dump, and the 1,000 stamped mega-prompts with **Midnight Aliit Builder & Nightforce Alpha**.

## What changes

- Site footer credit (`site-shell.tsx`) and About page attribution.
- Root metadata author tag.
- Slide deck title slide byline ("Arun Nadarasa · Midnight Aliit Builder & Nightforce Alpha").
- `/llms-full.txt` credit lines (two places).
- Strategy page sample footer credit text.
- Mega-prompt generator credit constant, then re-stamp all 1,000 ideas so every prompt carries the new credit.

## Technical notes

- Update `CREDIT` in `scripts/rewrite_mega_prompts.py`, then run it to rewrite the 10 JSON files in `src/data/ideas/`.
- Keep "Indian Krump Festival 14" as-is unless told otherwise; only the organisation name changes.
- Verify with a repo-wide search that no "StreetKode" string remains.
