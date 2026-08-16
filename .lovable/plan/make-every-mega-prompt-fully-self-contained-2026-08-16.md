# Make every mega-prompt fully self-contained

Participants paste a mega-prompt into a fresh Lovable project that has no Identus skill, no docs, and no house conventions. Today's prompts explain the concept and one primitive well, but they still lean on knowledge the skill would have supplied: the exact Cloud Agent request/response shapes beyond the single snippet, the actual `docker-compose.yml` (the Docker mode only says "ship a copyable compose block"), the Fly deployment settings, and the TanStack Start conventions the generated code must follow.

## What gets added to each prompt

1. **Cloud Agent API reference (compact)** — endpoint, request body, key response fields, and state machine for all four primitives (DID registrar, connections, issuance, presentation), plus `GET /_system/health` and the `apikey` header. Kept terse: one block per endpoint, not prose.
2. **Runtime conventions block** — TanStack Start rules the build must obey: routes in `src/routes`, `createServerFn` from `@tanstack/react-start`, read `process.env` inside the handler, no browser-side agent calls, `sonner` for toasts, semantic tokens in `src/styles.css`.
3. **Mode blocks become complete recipes**
   - Simulated: unchanged (already self-contained), plus explicit fixture shapes for each record type.
   - Docker: the full pinned `docker-compose.yml` (cloud-agent 1.40.0, prism-node 2.5.0, postgres 16 with the four databases), the init SQL, and the boot/health commands inline.
   - Fly.io: the three-machine deploy steps, required env vars (`DIDCOMM_SERVICE_URL`, `JAVA_TOOL_OPTIONS`, memory, health grace period), and the no-`/cloud-agent` rule.
4. **Reference links footer** — Identus docs, cloud-agent, sdk-ts, mediator repos, and this site's `/llms-full.txt` so a participant can feed their own LLM the deeper material.

Order in the prompt stays: concept → budget → primer → conventions → mode block → API reference → primitive snippet → user flow → design → market → gotchas → deliverable.

## Technical notes

- Edit `scripts/rewrite_mega_prompts.py`: add `CONVENTIONS` and `API_REFERENCE` constants, extend `build_prompt`, keep the `<<MODE_BLOCK>>` token so client-side mode substitution still works.
- Edit `src/data/modes.json`: expand the `setup` field of the `docker` and `fly` modes with the full compose file / deploy recipe; simulated gets the fixture shapes.
- Re-run the script to restamp all 1,000 ideas across the ten theme JSON files.
- Prompt length roughly doubles (to ~7–9 KB). That is acceptable for a paste-once build prompt; the copy button and `?prompt=` deep link both still work.
- No UI changes beyond the longer prompt rendering in `src/routes/ideas.$id.tsx`.
