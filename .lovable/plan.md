# Pivot: Sprites Creative → Hyperledger Identus Catalyst

Turn this archive into a Hyperledger Identus hackathon catalyst: 1,000 mega-prompts built on Identus self-sovereign identity primitives, each available in three agent modes, plus an LLM-readable knowledge file for participants.

## 1. New content model

**Four primitives** (replacing the Sprites hooks in `src/data/ideas/hooks.json`):

| id | name | kernel |
| --- | --- | --- |
| `identus-did` | DID Registrar | create + publish a `did:prism` with authentication/assertion keys |
| `identus-connection` | DIDComm Connection | invitation → accept → established peer channel (mediator-backed) |
| `identus-credential` | Credential Issuance | JWT/SD-JWT credential offer signed by a published issuer DID |
| `identus-verify` | Proof Presentation | presentation request → holder proof → verifier result |

**Themes stay creative.** The existing ten disciplines are kept exactly as they are (Dance, Music, Visual Art, Video, Photography, Writing, Film & Animation, Games, Theater, Fashion) — same slugs, audiences and market anchors, so the archive remains a creative-industry catalog. What changes is the recipe: every idea applies an Identus primitive to a real creative-industry identity problem (choreography credit credentials, stem-licence proofs, artwork provenance DIDs, press-badge verification, cast/crew credentials, player identity, ticket-holder proofs, garment authenticity, and so on).

100 ideas per theme, 25 per primitive (strict round-robin, so every theme page shows 4 primitives × 25).

## 2. Three agent modes

New `src/data/modes.json` + a mode selector that rewrites setup copy and the generated mega-prompt:

- **Simulated agent** — no external service; in-app mock of DIDs, connections, credentials. Zero secrets, always green. Default for a 5-credit one-shot build.
- **Docker / Sprites agent** — the Identus Compose stack (cloud-agent + prism-node + Postgres) reachable at `http://localhost:8085/cloud-agent`; Sprites is used to author/lint the Compose file.
- **Fly.io / Sprites agent** — dedicated Fly Machines deployment (Postgres → prism-node → cloud-agent), HTTPS at app root with no `/cloud-agent` prefix, `ADMIN_TOKEN` + `DEFAULT_WALLET_AUTH_API_KEY`.

Each mega-prompt embeds an Identus primer, the mode-specific setup block, the primitive-specific server-function snippet, and a gotchas block (strip `/cloud-agent` on Fly, `assertionMethod` key required to sign an offer, `DIDCOMM_SERVICE_URL` must be reachable, 300s health grace period, 4 GB agent memory).

The selected mode is client state on the idea page; the copy button emits the mode's variant. No backend, no secrets, no live agent calls.

## 3. Pages

- `/` — rewritten hero, four primitives, three modes, links to primer/themes/demo.
- `/themes`, `/themes/$theme`, `/ideas/$id` — same layout, new data, plus the mode selector on the idea page.
- `/primer` — Identus primer replacing `/quantum-primer` (old path permanently redirects).
- `/modes` — new page explaining the three modes side by side with setup steps.
- `/showcase` — reference build card linking to https://identus.lovable.app/ and https://github.com/arunnadarasa/identus, plus the four upstream repos (cloud-agent, sdk-ts, mediator, sdk-kmp, docs).
- `/strategy`, `/about` — reworded for Identus.
- `/llms` — page explaining the knowledge files and how to paste them into an LLM, with copy buttons.
- `public/llms.txt` (short index) and `public/llms-full.txt` (full participant knowledge base: primitives, three modes, agent REST surface, SDK-TS snippets, mediator, gotchas, doc links) — modelled on `https://docs.docker.com/llms-full.txt`.

## 4. Generation approach

- Rewrite `scripts/regenerate_ideas.py` to produce 1,000 Identus ideas — one call per (theme × primitive) = 40 batches of 25 — via the Lovable AI Gateway, with a checkpoint file so reruns resume. If no gateway key is available at run time, fall back to deterministic composition from curated per-theme sub-domain lists so the catalog is always fully populated.
- Rewrite `scripts/rewrite_mega_prompts.py` to stamp `quantumHook`/`quantumRationale`/`pitch`/`megaPrompt` from the new primitive templates, with the round-robin assignment (fixes the uneven-distribution bug in the previous plan at the same time).
- Add `scripts/build_llms_txt.py` to generate both public text files from the same source data so they never drift.

## 5. Technical notes

- Field names in `src/data/ideas.ts` stay (`quantumHook*`) to avoid touching every component, but the UI labels change to "primitive". A follow-up rename is optional.
- `src/lib/plain-language.ts` gets four new Identus templates.
- `src/components/quantum-chip.tsx` → `primitive-chip.tsx`; site header/footer nav updated.
- Verification: each theme JSON must return `{identus-did:25, identus-connection:25, identus-credential:25, identus-verify:25}`; every route keeps a unique `head()`; typecheck clean; preview loads `/`, a theme page, an idea page with all three mode variants, and `/llms-full.txt`.

## Out of scope

- No live agent provisioning, Fly/Sprites API calls, secrets, or Lovable Cloud in this app.
- No embedded iframe of the demo — showcase links out.
