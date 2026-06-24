
# Make every idea buildable on 5 free credits with real Guppy/Selene circuits

Two problems to fix:

1. The current mega-prompt is silent on **where** Guppy/Selene runs. Lovable apps deploy to Cloudflare Workers (edge JS), so Python cannot run at runtime. A naive participant will burn credits trying to call Selene from a TanStack server function and fail.
2. Free-tier participants have ~5 build credits. The prompt must produce a working pitchable demo in **one shot**, not a multi-step refinement loop.

The fix is a single pattern: **build-time quantum**.

## The pattern (what every mega-prompt will now instruct)

```text
1. In the Lovable Linux sandbox during the build:
     pip install guppylang selene-sim
2. Write the Guppy kernel as a real .py file at quantum/<kernel>.py
   (Guppy reads source via inspect — a real file is mandatory).
3. Write a driver script quantum/run.py that:
     - imports the @guppy kernel
     - compiles it
     - runs it on the Selene emulator over a small grid of
       representative inputs (5-20 samples, ≤8 qubits, ~256 shots)
     - writes the real results to src/data/quantum-results.json
4. Execute the driver once at build time. Commit the JSON.
5. The React frontend imports src/data/quantum-results.json and
   renders the results interactively (browse / filter / compare).
6. A "Quantum trace" disclosure shows the raw kernel output and the
   .py source, so judges see it is genuine Quantinuum quantum, not faked.
```

This is the only pattern that delivers real quantum + real frontend + pitchable demo on 5 credits.

## Mega-prompt rewrite

Edit `/tmp/build_ideas.py` so the `mega_prompt(...)` template produces a single one-shot prompt with:

- A **hard scope cap**: 1 page (the workspace) + a small "About the quantum" strip. No auth, no Lovable Cloud, no extra routes, no history page.
- **Explicit sandbox instructions** with the exact `pip install` and file paths above.
- The **kernel spec** (already present per hook) — kept short and concrete.
- The **precompute step**: enumerate the grid the driver iterates over, named the dataset the user manipulates (e.g. "10 candidate beats × 10 references = 100 SWAP-test fidelities").
- The **frontend spec**: how the precomputed JSON drives the UI (grid, slider, dropdown, etc.), with one accent color and one type family.
- A short **"Quantum trace" requirement**: surface fidelity/Betti/bitstring numbers and a "View Guppy source" link/disclosure.
- A **credit budget warning** at the end: "You have ~5 credits. Build this in ONE message. Do not add features beyond what is listed."

Then re-run `python /tmp/build_ideas.py` to regenerate all 1,000 ideas.

## Site updates

1. **New route `/strategy`** — a single page that explains the build-time quantum pattern in plain language: the pip-install, the .py kernel, the driver, the JSON, the React reader. Includes a copy-able starter snippet for a Guppy kernel + Selene driver + JSON write. Linked from the header.
2. **Update `/about`** — add a "Built for 5 credits" section pointing to `/strategy`.
3. **Update homepage** — add a third stat ("1 build message") and a small callout strip: "Designed to ship on Lovable's free tier."
4. **Update idea detail page (`/ideas/$id`)** — add a small "Credit budget" badge near the Copy button explaining one-shot intent, and a "Read the build strategy →" link to `/strategy`.
5. **Update `/quantum-primer`** — add one sentence per hook noting the typical grid shape used in precompute (e.g. "10×10 pairs", "single dataset of 32 points").

## Acceptance check

After regenerating, spot-check 3 ideas across 3 themes:
- mega-prompt explicitly says "Lovable Linux sandbox", names `guppylang` and `selene-sim`, and gives the exact file paths
- mentions JSON output and the React reader
- ends with the 5-credit one-shot warning
- total prompt length is under ~350 words so participants can read it fast

No backend, no Cloud, no auth. Site stays purely static.
