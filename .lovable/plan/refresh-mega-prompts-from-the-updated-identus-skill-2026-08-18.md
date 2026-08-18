# Refresh mega-prompts from the updated Identus skill

The three mode blocks and the universal gotchas were written before several hard-won
invariants landed in the Identus skill. Two of them are outright wrong today: the compose
stack and the Fly deploy both pin **Postgres 16**, which breaks the bundled Flyway
migrations, and neither creates the `*-application-user` roles the 1.40 agent logs in as.
A participant following the current prompt gets a crash-looping agent with an opaque
`Main child exited normally with code: 1`.

## Corrections to the mode blocks (`src/data/modes.json`)

**Docker**
- Pin `postgres:13-alpine` (16 fails with a syntax error near `FORMAT`).
- Rewrite `init-db.sh` to create the four databases **and** the three login roles
  (`pollux-application-user`, `connect-application-user`, `agent-application-user`),
  granting each schema usage plus privileges on all tables/sequences in its database.
- Point each `*_DB_USER` at its matching application user.
- Add a deterministic `DEFAULT_WALLET_SEED` (fixed hex, never regenerated per boot).

**Fly**
- Same Postgres pin and role-aware init.
- Every machine must set `config.metadata.fly_process_group` (or `--metadata
  fly_process_group=<name>`), otherwise it never appears in Fly private DNS and the agent
  dies with `UnknownHostException`.
- Keep the 4 GB agent, the IPv6 `JAVA_TOOL_OPTIONS`, the 300s health grace period, the
  8090 DIDComm port and the no-`/cloud-agent` rule; add the deterministic wallet seed.
- Add the debugging note: read boot logs through the machine `exec` API, not the log
  stream — a crash-looping machine never stays up for the stream. Recreating the Postgres
  machine is the only fix for missing roles; env edits cannot retro-create them.
- Note that a Fly readiness poll must cap at 60s (longer `timeout` values are rejected 400)
  and that a 404 from a machine/app read means "already gone", not an error.

**Simulated** — unchanged apart from adding a `dob` claim to the credential fixture so the
same shapes work if the build later adds an age proof.

## Additions to the universal blocks (`scripts/rewrite_mega_prompts.py`)

- `GOTCHAS`: only DIDs whose resolved document exposes an `assertionMethod` key may be
  offered as issuers — filter the picker and show why a DID was excluded; include a `dob`
  claim on issued credentials so an age/ZK proof stays possible; truncate DIDs/JWTs with a
  copy button rather than inline in prose.
- `API_REFERENCE`: keep as is; add the `GET /dids/{did}` assertionMethod check used by the
  issuer filter and the RFC-7807 note (already present).
- `CONVENTIONS`: add the `exactOptionalPropertyTypes` spread pattern
  (`...(x ? { prop: x } : {})`) and the rule that routes import only from `*.functions.ts`.

## Technical notes

- Edit `src/data/modes.json` (docker + fly `setup`/`gotchas`, simulated fixture) and the
  `GOTCHAS` / `CONVENTIONS` constants in `scripts/rewrite_mega_prompts.py`.
- Re-run `python3 scripts/rewrite_mega_prompts.py` to restamp all 1,000 ideas.
- Refresh the matching sections of `src/routes/llms-full[.]txt.ts` so the LLM dump agrees
  with the prompts.
- No UI changes; prompt size grows by roughly 1 KB per mode.
