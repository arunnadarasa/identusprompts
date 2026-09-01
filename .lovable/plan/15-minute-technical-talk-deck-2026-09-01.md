# 15-minute technical talk deck

Add a self-contained slide deck at `/deck` for the Identus Community Call, covering three
projects: **Identus Catalyst** (this app), **Hyperledger Identus NHS**, and **IPS Compass**.

## Deck mechanics

- `/deck` — full presentation surface: fixed 1920x1080 slides scaled to fit, arrow/space
  keyboard nav, slide counter, fullscreen "Present" button (Fullscreen API), `G` for a
  thumbnail grid overview.
- `/deck/$slide` — slide index in the URL so refresh and shared links land on the same slide.
- `/deck/print` — all slides stacked one per page for `Cmd+P → Save as PDF` handout.
- Styling reuses the existing site tokens (no new palette); slide-specific `--slide-*` size
  and color tokens added to `src/styles.css`, so restyling the deck is a one-place edit.

## Slide running order (15 min, ~12 slides)

1. **Title** — Identus in production-shaped demos. Speaker, date, community call.
2. **Why** — self-sovereign identity stalls at "what do I build and how do I run it".
   Two gaps: idea gap and infrastructure gap.
3. **Three projects, one thread** — Catalyst (ideation at scale), NHS (a domain vertical),
   IPS Compass (clinical + credential + ledger). One diagram.
4. **Identus Catalyst — what it is** — 1,000 hackathon-ready ideas across 10 creative
   themes, each mapped to one of four Identus primitives (DID, DIDComm connection,
   credential issuance, proof presentation), 25 per primitive per theme.
5. **The mega-prompt** — every idea ships a self-contained build prompt: runtime
   conventions, full Cloud Agent REST reference (endpoints, payloads, state machines,
   RFC-7807 errors), and a mode block. Show an anatomy diagram, not a wall of text.
6. **Three agent modes** — Simulated (fixtures mirroring Cloud Agent shapes), Docker
   (compose: cloud-agent 1.40.0, prism-node 2.5.0, postgres 13-alpine), Fly.io
   (three machines, 4GB, process-group DNS). Same prompt, swapped block.
7. **Gotchas we paid for** — postgres 13 not 16 (Flyway), the three application roles in
   `init-db.sh`, `assertionMethod` filtering when picking an issuer DID, deterministic
   wallet seed, 60s readiness caps. This is the slide the technical room wants.
8. **`/llms-full.txt`** — the whole knowledge base as plain text so participants point
   their own LLM at it.
9. **Identus NHS** — the vertical: credentials for NHS-shaped workflows, what maps cleanly
   onto Identus and what does not.
10. **IPS Compass** — FHIR IPS bundle → SHA-256 digest → Identus credential over the digest
    → Midnight anchor. Architecture diagram: browser → server functions → Lovable Cloud +
    Fly Machines API → Identus stack / Midnight stack. Emphasis: infra provisioned from
    inside the app, no local Docker, no CI.
11. **What this says about Identus DX** — where the Cloud Agent was pleasant, where the
    sharp edges are, what would help adopters most.
12. **Try it / links** — live URLs, GitHub repos, `/llms-full.txt`, contact.

Every number and claim on the slides comes from the repos and this project's own data —
no invented metrics. Where a figure would need real data we do not have, the slide carries a
visibly marked placeholder for you to fill.

## Technical notes

- New files: `src/components/slides/scaled-slide.tsx`, `slide-layout.tsx`, a slide registry
  `src/components/slides/registry.ts`, one component per slide, and routes
  `src/routes/deck.tsx`, `deck.index.tsx`, `deck.$slide.tsx`, `deck.print.tsx`.
- Deck is a leaf area of the existing app; the site shell is hidden on `/deck` routes.
- Each deck route gets its own `head()` metadata (title, description, og tags).
- No backend changes, no new dependencies.
