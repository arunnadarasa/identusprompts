# Add GitHub repo links to the deck

Show the source repository for each of the three projects, so the audience can find the code from any relevant slide.

## Changes

All in `src/components/slides/registry.tsx`.

1. **"Try it" slide (final slide)** — replace the two-repo "Source" card with a paired app ↔ repo list so each project shows both:
   - Identus Catalyst — identusprompts.lovable.app / github.com/arunnadarasa/identusprompts
   - Identus Hub / NHS — identus.lovable.app / github.com/arunnadarasa/identus
   - IPS Compass — ipsmidnight.lovable.app / github.com/arunnadarasa/ipsmidnight
   Keep the "For your LLM" card (llms-full.txt + identus.io docs) and the closing question line.

2. **Three-projects overview slide** — add the matching `github.com/arunnadarasa/...` handle as a small mono caption under each project card, so the repo is visible early in the talk, not only at the end.

3. **Title slide** — add `github.com/arunnadarasa` under the existing app URL line.

Repo strings render in the existing mono/caption style used elsewhere in the deck; no new tokens or components. Print route and slide count are unchanged.
